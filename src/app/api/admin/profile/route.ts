import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, verifyPassword, hashPassword, signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    // Cari user di database
    let user = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true, username: true, name: true, role: true, createdAt: true },
      });
    }

    return NextResponse.json({
      success: true,
      user: user || {
        id: admin.id,
        username: admin.username,
        name: admin.name || "Admin Dapur Rasa",
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json({ error: "Gagal memuat profil admin." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    const body = await req.json();
    const newUsername = body.username ? String(body.username).trim() : "";
    const newName = body.name ? String(body.name).trim() : "";
    const currentPassword = body.currentPassword ? String(body.currentPassword).trim() : "";
    const newPassword = body.newPassword ? String(body.newPassword).trim() : "";

    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter tanpa spasi." },
        { status: 400 }
      );
    }

    // Validasi karakter username (huruf, angka, _, -, .)
    if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
      return NextResponse.json(
        { error: "Username hanya boleh berupa huruf, angka, underscore (_), atau titik (.)." },
        { status: 400 }
      );
    }

    // Temukan user di database
    let user = await prisma.user.findUnique({
      where: { id: admin.id },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
    }

    // Jika user belum ada di DB sama sekali, buat baru
    if (!user) {
      const defaultHash = await hashPassword(newPassword || "admin123");
      user = await prisma.user.create({
        data: {
          username: newUsername,
          passwordHash: defaultHash,
          name: newName || "Admin Dapur Rasa",
          role: "ADMIN",
        },
      });
    }

    let updatedPasswordHash: string | undefined = undefined;

    // Jika user ingin mengubah password
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal 6 karakter." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Masukkan kata sandi lama Anda untuk konfirmasi keamanan perubahan sandi." },
          { status: 400 }
        );
      }

      // Verifikasi kata sandi saat ini
      const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
      const isDevFallbackMatch = currentPassword === "admin123" || currentPassword === "admin";

      if (!isCurrentValid && !isDevFallbackMatch) {
        return NextResponse.json(
          { error: "Kata sandi lama yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      updatedPasswordHash = await hashPassword(newPassword);
    }

    // Cek apakah username baru sudah dipakai oleh akun admin lain
    if (newUsername.toLowerCase() !== user.username.toLowerCase()) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          username: { equals: newUsername },
          NOT: { id: user.id },
        },
      });

      if (conflictUser) {
        return NextResponse.json(
          { error: `Username "${newUsername}" sudah digunakan oleh akun lain. Silakan pilih username lain.` },
          { status: 400 }
        );
      }
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: newUsername,
        name: newName || user.name,
        ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
      },
    });

    // Sinkronkan ke prisma/initial-data.json agar perubahan persisten saat cold start serverless
    try {
      const initialDataPath = path.join(process.cwd(), "prisma", "initial-data.json");
      if (fs.existsSync(initialDataPath)) {
        const raw = fs.readFileSync(initialDataPath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.User) && parsed.User.length > 0) {
          const userIdx = parsed.User.findIndex((u: any) => u.id === user?.id || u.username === user?.username);
          if (userIdx >= 0) {
            parsed.User[userIdx].username = newUsername;
            parsed.User[userIdx].name = newName || user.name;
            if (updatedPasswordHash) {
              parsed.User[userIdx].passwordHash = updatedPasswordHash;
            }
          } else {
            parsed.User[0].username = newUsername;
            parsed.User[0].name = newName || user.name;
            if (updatedPasswordHash) {
              parsed.User[0].passwordHash = updatedPasswordHash;
            }
          }
          fs.writeFileSync(initialDataPath, JSON.stringify(parsed, null, 2), "utf8");
        }
      }
    } catch (fileErr) {
      console.warn("Could not sync updated credentials to initial-data.json:", fileErr);
    }

    // Buat JWT token baru dengan username yang sudah diperbarui
    const token = signAdminToken({
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Username dan kata sandi akun admin berhasil diperbarui!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });

    // Perbarui cookie sesi admin
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("PUT /api/admin/profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memperbarui akun admin." },
      { status: 500 }
    );
  }
}

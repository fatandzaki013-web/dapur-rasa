import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    // Allow upload in dev or if admin session is verified
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login terlebih dahulu di /admin/login." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap gunakan format JPEG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal ukuran file adalah 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extension from mime type or file name
    const ext = path.extname(file.name).toLowerCase() || (file.type === "image/png" ? ".png" : ".jpg");
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext) ? ext : ".jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`;

    try {
      // 1. Coba simpan ke filesystem public/uploads (cocok untuk VPS / Docker / Railway dengan persistent volume)
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        size: file.size,
      });
    } catch (fsErr) {
      // 2. Fallback untuk lingkungan read-only (seperti serverless Vercel / Netlify tanpa persistent volume)
      // Simpan sebagai Data URI base64 agar foto tetap tersimpan langsung di database dan tidak hilang saat online
      console.warn("Penyimpanan file lokal tidak tersedia atau read-only, beralih ke Base64 Data URI:", fsErr);
      const mimeType = file.type || "image/jpeg";
      const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: base64Url,
        filename,
        size: file.size,
        isBase64: true,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file. Silakan coba lagi." }, { status: 500 });
  }
}

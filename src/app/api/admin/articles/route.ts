import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const articles = await (prisma as any).article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: { articles },
    });
  } catch (error) {
    console.error("Admin articles GET error:", error);
    return NextResponse.json({ error: "Gagal memuat artikel." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Judul artikel wajib diisi." }, { status: 400 });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const article = await (prisma as any).article.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt?.trim() || null,
        content: content?.trim() || "",
        coverImage: coverImage?.trim() || null,
        category: category?.trim() || "Kuliner & Resep",
        tags: Array.isArray(tags) ? tags.join(", ") : (tags || null),
        status: status || "PUBLISHED",
        authorName: admin.name || "Super Admin",
        seoTitle: seoTitle?.trim() || title.trim(),
        seoDescription: seoDescription?.trim() || excerpt?.trim() || null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dibuat.",
      data: { article },
    });
  } catch (error: any) {
    console.error("Admin articles POST error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug atau judul artikel sudah digunakan." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan artikel baru." }, { status: 500 });
  }
}

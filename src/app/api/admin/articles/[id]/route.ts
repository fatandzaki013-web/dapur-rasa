import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const article = await (prisma as any).article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error("Admin article GET error:", error);
    return NextResponse.json({ error: "Gagal memuat data artikel." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const existing = await (prisma as any).article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

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

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (slug !== undefined) {
      data.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (excerpt !== undefined) data.excerpt = excerpt ? excerpt.trim() : null;
    if (content !== undefined) data.content = content.trim();
    if (coverImage !== undefined) data.coverImage = coverImage ? coverImage.trim() : null;
    if (category !== undefined) data.category = category.trim();
    if (tags !== undefined) {
      data.tags = Array.isArray(tags) ? tags.join(", ") : tags;
    }
    if (status !== undefined) {
      data.status = status;
      if (status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }
    if (seoTitle !== undefined) data.seoTitle = seoTitle ? seoTitle.trim() : null;
    if (seoDescription !== undefined) data.seoDescription = seoDescription ? seoDescription.trim() : null;

    const updated = await (prisma as any).article.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui.",
      data: { article: updated },
    });
  } catch (error: any) {
    console.error("Admin article PUT error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug atau judul artikel sudah digunakan." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui artikel." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await (prisma as any).article.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus.",
    });
  } catch (error) {
    console.error("Admin article DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus artikel." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat kategori." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, slug, description, imageUrl, displayOrder, isActive, showOnHome } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
    }

    const catSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const existing = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug kategori sudah digunakan." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: catSlug,
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isActive: isActive ?? true,
        showOnHome: showOnHome ?? true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ error: "Gagal membuat kategori." }, { status: 500 });
  }
}

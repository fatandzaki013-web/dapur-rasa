import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.galleryItem.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat galeri." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, imageUrl, caption, categoryTag, altText, productId, isPublished, displayOrder } = await req.json();

    if (!title?.trim() || !imageUrl?.trim()) {
      return NextResponse.json({ error: "Judul foto dan URL gambar wajib diisi." }, { status: 400 });
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        caption: caption?.trim() || null,
        categoryTag: categoryTag?.trim() || null,
        altText: altText?.trim() || title.trim(),
        productId: productId || null,
        isPublished: isPublished ?? true,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Gallery POST error:", error);
    return NextResponse.json({ error: "Gagal menambahkan foto galeri." }, { status: 500 });
  }
}

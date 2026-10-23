import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title, imageUrl, caption, categoryTag, altText, productId, isPublished, displayOrder } = await req.json();

    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl.trim() : undefined,
        caption: caption !== undefined ? caption?.trim() : undefined,
        categoryTag: categoryTag !== undefined ? categoryTag?.trim() : undefined,
        altText: altText !== undefined ? altText?.trim() : undefined,
        productId: productId !== undefined ? (productId || null) : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui item galeri." }, { status: 500 });
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
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus item galeri." }, { status: 500 });
  }
}

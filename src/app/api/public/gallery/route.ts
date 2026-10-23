import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery API error:", error);
    return NextResponse.json({ error: "Gagal memuat galeri." }, { status: 500 });
  }
}

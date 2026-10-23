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
    const body = await req.json();

    const item = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: body.customerName !== undefined ? body.customerName.trim() : undefined,
        comment: body.comment !== undefined ? body.comment.trim() : undefined,
        rating: body.rating !== undefined ? Number(body.rating) : undefined,
        avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl?.trim() : undefined,
        eventOrProduct: body.eventOrProduct !== undefined ? body.eventOrProduct?.trim() : undefined,
        isApproved: body.isApproved !== undefined ? Boolean(body.isApproved) : undefined,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
      },
    });

    return NextResponse.json({ success: true, testimonial: item });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui testimoni." }, { status: 500 });
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
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Testimoni berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus testimoni." }, { status: 500 });
  }
}

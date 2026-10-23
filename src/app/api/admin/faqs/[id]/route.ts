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

    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        question: body.question !== undefined ? body.question.trim() : undefined,
        answer: body.answer !== undefined ? body.answer.trim() : undefined,
        category: body.category !== undefined ? body.category.trim() : undefined,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, faq: item });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui FAQ." }, { status: 500 });
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
    await prisma.faqItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "FAQ berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus FAQ." }, { status: 500 });
  }
}

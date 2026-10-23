import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const faqs = await prisma.faqItem.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat FAQ." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question, answer, category, displayOrder, isActive } = await req.json();

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: "Pertanyaan dan jawaban wajib diisi." }, { status: 400 });
    }

    const item = await prisma.faqItem.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || "Umum",
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, faq: item });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat FAQ." }, { status: 500 });
  }
}

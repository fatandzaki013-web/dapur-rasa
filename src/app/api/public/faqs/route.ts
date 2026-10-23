import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("FAQ API error:", error);
    return NextResponse.json({ error: "Gagal memuat FAQ." }, { status: 500 });
  }
}

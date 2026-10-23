import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Testimonials API error:", error);
    return NextResponse.json({ error: "Gagal memuat testimoni." }, { status: 500 });
  }
}

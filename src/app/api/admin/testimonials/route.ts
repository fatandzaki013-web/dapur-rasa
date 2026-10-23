import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat testimoni." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { customerName, comment, rating, avatarUrl, eventOrProduct, isApproved, displayOrder, isSample } = await req.json();

    if (!customerName?.trim() || !comment?.trim()) {
      return NextResponse.json({ error: "Nama pelanggan dan komentar ulasan wajib diisi." }, { status: 400 });
    }

    const item = await prisma.testimonial.create({
      data: {
        customerName: customerName.trim(),
        comment: comment.trim(),
        rating: rating ? Number(rating) : 5,
        avatarUrl: avatarUrl?.trim() || null,
        eventOrProduct: eventOrProduct?.trim() || null,
        isApproved: isApproved ?? true,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isSample: isSample ?? false,
      },
    });

    return NextResponse.json({ success: true, testimonial: item });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat testimoni." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Testimonials API error:", error);
    return NextResponse.json({ error: "Gagal memuat testimoni." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      comment,
      rating = 5,
      feedbackType = "ULASAN",
      eventOrProduct,
    } = body;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { error: "Nama Anda wajib diisi." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { error: "Pesan komentar / saran & kritik wajib diisi." },
        { status: 400 }
      );
    }

    let defaultTag = "Ulasan Pelanggan";
    if (feedbackType === "SARAN") defaultTag = "Saran & Masukan";
    else if (feedbackType === "KRITIK") defaultTag = "Kritik Membangun";

    const cleanTag = eventOrProduct?.trim() ? eventOrProduct.trim() : defaultTag;
    const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: customerName.trim(),
        comment: comment.trim(),
        rating: cleanRating,
        eventOrProduct: cleanTag,
        isApproved: true,
        isSample: false,
        displayOrder: 0,
      },
    });

    // Revalidate paths so new review appears immediately
    revalidatePath("/");
    revalidatePath("/testimoni");

    return NextResponse.json({
      success: true,
      message: "Terima kasih atas ulasan dan masukan berharga Anda!",
      testimonial,
    });
  } catch (error) {
    console.error("Gagal menyimpan testimoni/saran:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan ulasan Anda." },
      { status: 500 }
    );
  }
}

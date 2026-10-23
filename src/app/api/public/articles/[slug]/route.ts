import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await (prisma as any).article.findUnique({
      where: { slug },
    });

    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error("Public article GET error:", error);
    return NextResponse.json({ error: "Gagal memuat artikel." }, { status: 500 });
  }
}

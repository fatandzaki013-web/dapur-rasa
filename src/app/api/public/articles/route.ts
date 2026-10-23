import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      status: "PUBLISHED",
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const articles = await (prisma as any).article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { articles },
    });
  } catch (error) {
    console.error("Public articles GET error:", error);
    return NextResponse.json({ error: "Gagal memuat artikel." }, { status: 500 });
  }
}

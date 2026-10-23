import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [settings, theme, sections, categories] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { id: "default" } }),
      prisma.themeConfig.findUnique({ where: { id: "default" } }),
      prisma.homepageSection.findMany({
        where: { isEnabled: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: { isAvailable: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      settings,
      theme,
      sections,
      categories,
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json({ error: "Gagal memuat data toko." }, { status: 500 });
  }
}

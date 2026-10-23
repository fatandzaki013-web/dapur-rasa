import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalGallery,
      orders,
      recentOrders,
      categoriesCount,
      lowStockProducts,
      categoriesWithCount,
      recentWeekOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.galleryItem.count(),
      prisma.order.findMany({
        select: { status: true, totalAmount: true, paymentStatus: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.category.count(),
      prisma.product.findMany({
        where: { stock: { lte: 15 } },
        take: 5,
        select: { id: true, name: true, stock: true, unit: true, price: true },
        orderBy: { stock: "asc" },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
        orderBy: { products: { _count: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true, totalAmount: true, status: true },
      }),
    ]);

    // Order status counts
    const statusCounts = {
      MENUNGGU_KONFIRMASI: 0,
      DIKONFIRMASI: 0,
      SEDANG_DIPROSES: 0,
      SIAP_DIAMBIL: 0,
      SIAP_DIKIRIM: 0,
      SELESAI: 0,
      DIBATALKAN: 0,
    };

    let confirmedRevenue = 0;

    for (const ord of orders) {
      if (statusCounts[ord.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[ord.status as keyof typeof statusCounts]++;
      }
      if (["DIKONFIRMASI", "SEDANG_DIPROSES", "SIAP_DIAMBIL", "SIAP_DIKIRIM", "SELESAI"].includes(ord.status)) {
        confirmedRevenue += ord.totalAmount;
      }
    }

    // Build 7-day sales trend
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const last7Days: Array<{ date: string; dayName: string; revenue: number; orderCount: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      last7Days.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        revenue: 0,
        orderCount: 0,
      });
    }

    for (const ord of recentWeekOrders) {
      const ordDate = ord.createdAt.toISOString().slice(0, 10);
      const dayObj = last7Days.find((d) => d.date === ordDate);
      if (dayObj) {
        dayObj.orderCount++;
        dayObj.revenue += ord.totalAmount;
      }
    }

    return NextResponse.json({
      metrics: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalGallery,
        categoriesCount,
        totalOrders: orders.length,
        statusCounts,
        confirmedRevenue,
      },
      recentOrders,
      lowStockProducts,
      topCategories: categoriesWithCount,
      weeklyTrend: last7Days,
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json({ error: "Gagal memuat data ringkasan." }, { status: 500 });
  }
}

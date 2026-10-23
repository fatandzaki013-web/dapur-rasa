import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [products, recentLogs] = await Promise.all([
      prisma.product.findMany({
        orderBy: { stock: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          unit: true,
          stock: true,
          minStockAlert: true,
          isAvailable: true,
          category: { select: { name: true } },
        },
      }),
      prisma.stockLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Attach product names to logs
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const logsWithNames = recentLogs.map((log) => ({
      ...log,
      productName: productMap.get(log.productId) || "Produk",
    }));

    return NextResponse.json({ products, logs: logsWithNames });
  } catch (error) {
    console.error("Stock GET error:", error);
    return NextResponse.json({ error: "Gagal memuat data stok." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, newStock, reason } = await req.json();

    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: "Product ID dan stok baru wajib diisi." }, { status: 400 });
    }

    const targetStock = Number(newStock);
    if (isNaN(targetStock) || targetStock < 0) {
      return NextResponse.json({ error: "Stok tidak boleh bernilai negatif." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    const previousStock = product.stock;
    const changeAmount = targetStock - previousStock;

    if (changeAmount === 0) {
      return NextResponse.json({ message: "Stok tidak mengalami perubahan.", product });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: targetStock,
        // Otomatis ubah status availability jika stok habis
        isAvailable: targetStock > 0 ? product.isAvailable : false,
      },
    });

    await prisma.stockLog.create({
      data: {
        productId,
        changeAmount,
        previousStock,
        newStock: targetStock,
        reason: reason?.trim() || "Penyesuaian stok manual oleh admin",
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Stock POST error:", error);
    return NextResponse.json({ error: "Gagal memperbarui stok." }, { status: 500 });
  }
}

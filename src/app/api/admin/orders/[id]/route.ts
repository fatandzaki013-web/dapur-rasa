import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, stock: true } },
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat pesanan." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, adminNotes, reduceStockOnConfirm } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // Jika admin mengonfirmasi pesanan dan meminta pengurangan stok
    if (
      status === "DIKONFIRMASI" &&
      existingOrder.status !== "DIKONFIRMASI" &&
      reduceStockOnConfirm
    ) {
      for (const item of existingOrder.items) {
        if (item.productId) {
          const prod = await prisma.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const newStock = Math.max(0, prod.stock - item.quantity);
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: newStock },
            });
            await prisma.stockLog.create({
              data: {
                productId: item.productId,
                changeAmount: -item.quantity,
                previousStock: prod.stock,
                newStock,
                reason: `Pengurangan stok otomatis untuk pesanan ${existingOrder.orderCode}`,
              },
            });
          }
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Order PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pesanan berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pesanan." }, { status: 500 });
  }
}

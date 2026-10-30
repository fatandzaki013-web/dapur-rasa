import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildWhatsAppApiUrl,
  getWhatsAppDisplayNumber,
  getWhatsAppNumber,
} from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      fulfillmentType,
      deliveryAddress,
      scheduleDate,
      scheduleTime,
      notes,
      items,
      isSnackBoxPackage = false,
      snackBoxQuantity = 0,
      paymentMethod = "COD",
      occasion,
      packaging,
      servingPreference,
    } = body;

    // 1. Validasi Data Pelanggan
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json({ error: "Nama pelanggan wajib diisi." }, { status: 400 });
    }

    if (!customerPhone || typeof customerPhone !== "string" || !customerPhone.trim()) {
      return NextResponse.json({ error: "Nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    // Format WA number to clean digits
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid (minimal 9 digit angka)." },
        { status: 400 }
      );
    }

    const type = fulfillmentType === "DELIVERY" ? "DELIVERY" : "PICKUP";
    if (type === "DELIVERY") {
      if (!deliveryAddress || !deliveryAddress.trim()) {
        return NextResponse.json(
          { error: "Mohon sertakan alamat lengkap pengantaran (khusus area Perum Griya Cileungsi 5)." },
          { status: 400 }
        );
      }

      // Paket box disesuaikan fleksibel tanpa batasan minimum
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang pesanan masih kosong." }, { status: 400 });
    }

    // 2. Ambil Konfigurasi Toko untuk Ongkir & Nomor WA Toko
    const settings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    const storeWa = getWhatsAppNumber(settings?.whatsappNumber);
    const shippingFee = 0; // Free Ongkir untuk area Griya Cileungsi 5

    // 3. Re-validasi Harga, Varian, dan Ketersediaan Stok dari Database
    let verifiedSubtotal = 0;
    let totalItemsCount = 0;
    const verifiedOrderItems: Array<{
      productId: string;
      productName: string;
      variantName: string | null;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Format item pesanan tidak valid." }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.isAvailable) {
        return NextResponse.json(
          { error: `Produk "${item.name || "terpilih"}" saat ini tidak tersedia.` },
          { status: 400 }
        );
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok produk "${product.name}" tidak mencukupi (sisa ${product.stock} ${product.unit}).`,
          },
          { status: 400 }
        );
      }

      let unitPrice = product.price;
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant && variant.isAvailable) {
          unitPrice += variant.priceAdjustment;
          variantName = variant.name;
        }
      }

      const itemSubtotal = unitPrice * item.quantity;
      verifiedSubtotal += itemSubtotal;
      totalItemsCount += item.quantity;

      verifiedOrderItems.push({
        productId: product.id,
        productName: product.name,
        variantName,
        unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Check minimum order amount if set
    if (settings?.minOrderAmount && verifiedSubtotal < settings.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimal pemesanan adalah Rp ${settings.minOrderAmount.toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    const totalAmount = verifiedSubtotal + shippingFee;

    // 4. Generate Order Code Unik: DR-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `DR-${dateStr}-${randomSuffix}`;

    // Map label metode pembayaran
    let paymentMethodLabel = "💵 Bayar Tunai saat Diterima (COD)";
    if (paymentMethod === "TRANSFER_BANK" || paymentMethod?.includes("TRANSFER")) {
      paymentMethodLabel = "🏦 Transfer Bank (BCA / Mandiri / BRI)";
    } else if (paymentMethod === "QRIS_EWALLET" || paymentMethod?.includes("QRIS")) {
      paymentMethodLabel = "📱 QRIS / E-Wallet (GoPay, OVO, ShopeePay, Dana)";
    }

    // Kompilasi catatan & preferensi ke dalam database
    const extraDetailsParts: string[] = [];
    if (occasion) extraDetailsParts.push(`Keperluan: ${occasion}`);
    if (packaging) extraDetailsParts.push(`Kemasan: ${packaging}`);
    if (servingPreference) extraDetailsParts.push(`Preferensi: ${servingPreference}`);
    if (notes && notes.trim()) extraDetailsParts.push(`Catatan: ${notes.trim()}`);

    const compiledNotes = extraDetailsParts.join(" | ") || null;

    // 5. Simpan Pesanan ke Database
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        fulfillmentType: type,
        deliveryAddress: type === "DELIVERY" ? deliveryAddress.trim() : null,
        scheduleDate: scheduleDate || null,
        scheduleTime: scheduleTime || null,
        notes: compiledNotes,
        paymentMethod: paymentMethodLabel,
        status: "MENUNGGU_KONFIRMASI",
        paymentStatus: "BELUM_DIVERIFIKASI",
        subtotal: verifiedSubtotal,
        shippingFee,
        discount: 0,
        totalAmount,
        items: {
          create: verifiedOrderItems.map((oi) => ({
            productId: oi.productId,
            productName: oi.productName,
            variantName: oi.variantName,
            unitPrice: oi.unitPrice,
            quantity: oi.quantity,
            subtotal: oi.subtotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 6. Format Pesan WhatsApp Singkat, Padat & Memuat Catatan Pemesan (Tanpa Alamat Toko)
    const brand = settings?.brandName || "Dapur Rasa";

    // Daftar pesanan ringkas & to the point
    const itemsListText = verifiedOrderItems
      .map(
        (it) =>
          `• ${it.productName}${it.variantName ? ` (${it.variantName})` : ""} (${it.quantity}x)`
      )
      .join("\n");

    const deliveryLine =
      type === "DELIVERY"
        ? `*Pengiriman:* Diantar ke ${deliveryAddress.trim()}`
        : "*Pengiriman:* Diambil Sendiri";

    let paymentText = "COD";
    if (paymentMethod === "QRIS") {
      paymentText = "QRIS";
    } else if (paymentMethod === "GOPAY" || paymentMethod === "NO_REK_GOPAY") {
      paymentText = `Transfer GoPay (${getWhatsAppDisplayNumber(settings?.whatsappNumber)})`;
    }

    const notesLine = notes && notes.trim() ? `\n*Catatan:* ${notes.trim()}` : "";

    const waMessage = `Halo ${brand}, saya mau pesan:

${itemsListText}

*Total:* Rp ${totalAmount.toLocaleString("id-ID")}
*Pemesan:* ${customerName.trim()} (${cleanPhone})
${deliveryLine}
*Pembayaran:* ${paymentText}${notesLine}

Mohon segera diproses ya, terima kasih!`;

    const whatsappUrl = buildWhatsAppApiUrl(waMessage, storeWa);

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dibuat.",
      orderCode,
      orderId: order.id,
      subtotal: verifiedSubtotal,
      shippingFee,
      totalAmount,
      fulfillmentType: type,
      deliveryAddress: type === "DELIVERY" ? deliveryAddress.trim() : null,
      paymentMethodLabel,
      occasion: occasion || null,
      packaging: packaging || null,
      servingPreference: servingPreference || null,
      notes: notes?.trim() || null,
      whatsappUrl,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}

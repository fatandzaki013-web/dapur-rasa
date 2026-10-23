import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

      // Validasi ketentuan pengantaran paket box: minimal harus > 50 box
      if (isSnackBoxPackage && Number(snackBoxQuantity) <= 50) {
        return NextResponse.json(
          { error: "Untuk pengantaran paket box acara, jumlah pesanan minimal harus lebih dari 50 box." },
          { status: 400 }
        );
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang pesanan masih kosong." }, { status: 400 });
    }

    // 2. Ambil Konfigurasi Toko untuk Ongkir & Nomor WA Toko (Nomor WA resmi: 085888159765)
    const settings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    const storeWa = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "6285888159765";
    const shippingFee = type === "DELIVERY" ? (settings?.defaultShippingFee ?? 10000) : 0;

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
        notes: notes ? notes.trim() : null,
        paymentMethod: type === "DELIVERY" ? "BAYAR_SAAT_DIANTAR" : "BAYAR_SAAT_DIAMBIL",
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

    // 6. Format Pesan WhatsApp Terstruktur
    const itemsListText = verifiedOrderItems
      .map(
        (it) =>
          `• ${it.productName}${it.variantName ? ` (${it.variantName})` : ""} × ${it.quantity} = Rp ${it.subtotal.toLocaleString("id-ID")}`
      )
      .join("\n");

    const shippingText =
      type === "DELIVERY"
        ? `Rp ${shippingFee.toLocaleString("id-ID")} (Pengantaran Area Perum Griya Cileungsi 5)`
        : "Gratis (Ambil Sendiri di Dapur Toko)";

    const scheduleText =
      scheduleDate && scheduleTime
        ? `${scheduleDate} pukul ${scheduleTime}`
        : scheduleDate
        ? scheduleDate
        : "Segera / Sesuai kesepakatan";

    const packageBoxText = isSnackBoxPackage
      ? `\n• Paket Box Acara: *Ya (${snackBoxQuantity || totalItemsCount} Box)*`
      : "";

    const deliveryDetailText =
      type === "DELIVERY"
        ? `• Pilihan: *Diantar ke Alamat Rumah*\n• Alamat Lengkap: *${deliveryAddress.trim()}* (Khusus Griya Cileungsi 5)`
        : `• Pilihan: *Ambil Sendiri di Dapur Toko*\n• Lokasi Dapur: *Perum Griya Cileungsi 5*`;

    const waMessage = `Halo ${settings?.brandName || "Dapur Rasa"}, saya ingin memesan kue rumahan.

*RINCIAN PESANAN:*
• No. Referensi: *${orderCode}*
• Nama Pemesan: ${customerName.trim()}
• No. WhatsApp: ${cleanPhone}

*DAFTAR PESANAN KUE:*
${itemsListText}

----------------------------
• Subtotal: Rp ${verifiedSubtotal.toLocaleString("id-ID")}
• Ongkos Kirim: ${shippingText}
• *TOTAL TAGIHAN: Rp ${totalAmount.toLocaleString("id-ID")}*
----------------------------

*PENGAMBILAN / PENGANTARAN:*
${deliveryDetailText}${packageBoxText}
• Waktu / Jadwal: ${scheduleText}
${notes ? `• Catatan Khusus: ${notes.trim()}\n` : ""}
Mohon konfirmasi pesanan saya. Terima kasih banyak!`;

    // Pastikan nomor WhatsApp internasional valid (6285888159765)
    let formattedWa = storeWa;
    if (formattedWa.startsWith("0")) {
      formattedWa = "62" + formattedWa.slice(1);
    } else if (!formattedWa.startsWith("62")) {
      formattedWa = "62" + formattedWa;
    }

    const whatsappUrl = `https://wa.me/${formattedWa}?text=${encodeURIComponent(waMessage)}`;

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

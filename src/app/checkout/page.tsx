"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Phone,
  CheckCircle,
  Truck,
  Store,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Copy,
  Info,
  Printer,
  Heart,
  UtensilsCrossed,
  MapPin,
  FileCheck2,
  Check,
} from "lucide-react";

interface CompletedOrderInfo {
  orderCode: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  customerName: string;
  customerPhone: string;
  fulfillmentType: "PICKUP" | "DELIVERY";
  deliveryAddress: string;
  scheduleDate: string;
  scheduleTime: string;
  notes: string;
  createdAtFormatted: string;
  items: Array<{
    name: string;
    variantName?: string | null;
    quantity: number;
    price: number;
  }>;
  whatsappUrl: string;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings, formatPrice } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [notes, setNotes] = useState("");

  // Snack Box Package Delivery Option (> 50 box requirement)
  const [isSnackBoxPackage, setIsSnackBoxPackage] = useState(false);
  const [snackBoxQuantity, setSnackBoxQuantity] = useState<number>(55);

  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed order data for rendering the official receipt
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  const defaultShippingFee = settings?.defaultShippingFee ?? 10000;
  const shippingFee = fulfillmentType === "DELIVERY" ? defaultShippingFee : 0;
  const totalAmount = subtotal + shippingFee;

  const handleCopyReceiptText = () => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map(
        (it) =>
          `• ${it.name}${it.variantName ? ` (${it.variantName})` : ""} x ${it.quantity} = ${formatPrice(
            it.price * it.quantity
          )}`
      )
      .join("\n");

    const receiptText = `====================================
BUKTI TRANSAKSI RESMI - DAPUR RASA
Kue Rumahan Kualitas Premium Fresh
====================================
No. Referensi : ${completedOrder.orderCode}
Tanggal Waktu : ${completedOrder.createdAtFormatted}
Nama Pemesan  : ${completedOrder.customerName}
No. WhatsApp  : ${completedOrder.customerPhone}

METODE PENERIMAAN:
${
  completedOrder.fulfillmentType === "DELIVERY"
    ? `• Status: DIANTAR KE ALAMAT RUMAH\n• Alamat Lengkap: ${completedOrder.deliveryAddress || "Perum Griya Cileungsi 5"}`
    : "• Status: AMBIL SENDIRI DI DAPUR TOKO (Perum Griya Cileungsi 5)"
}

RINCIAN PESANAN KUE:
${itemsList}

Subtotal      : ${formatPrice(completedOrder.subtotal)}
Ongkos Kirim  : ${formatPrice(completedOrder.shippingFee)}
TOTAL TAGIHAN : ${formatPrice(completedOrder.totalAmount)}
Status Bayar  : Bayar saat Pesanan Diterima (COD / Tunai)
====================================
CATATAN KHUSUS:
• Seluruh kue diproduksi fresh tanpa bahan pengawet.
• Pengantaran kurir khusus area Perum Griya Cileungsi 5.
${completedOrder.notes ? `• Catatan: ${completedOrder.notes}\n` : ""}
UCAPAN TERIMA KASIH:
Terima kasih banyak telah memesan di Dapur Rasa!
Pesanan Anda sangat berharga bagi dapur rumahan kami.
====================================`;

    navigator.clipboard.writeText(receiptText);
    setIsCopiedReceipt(true);
    setTimeout(() => setIsCopiedReceipt(false), 2500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!customerName.trim()) {
      setErrorMessage("Nama pemesan wajib diisi.");
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) {
      setErrorMessage("Nomor WhatsApp minimal 9 digit angka.");
      return;
    }

    if (fulfillmentType === "DELIVERY") {
      if (!deliveryAddress.trim()) {
        setErrorMessage("Mohon sertakan alamat lengkap pengantaran (khusus area Perum Griya Cileungsi 5).");
        return;
      }

      if (isSnackBoxPackage && (!snackBoxQuantity || Number(snackBoxQuantity) <= 50)) {
        setErrorMessage("Untuk pesanan pengantaran paket box acara, jumlah pesanan minimal harus lebih dari 50 box.");
        return;
      }
    }

    if (items.length === 0) {
      setErrorMessage("Keranjang pesanan Anda kosong.");
      return;
    }

    setIsSubmitting(true);

    // Snapshot items for receipt
    const orderItemsSnapshot = items.map((it) => ({
      name: it.name,
      variantName: it.variantName || null,
      quantity: it.quantity,
      price: it.price,
    }));

    const nowFormatted = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          fulfillmentType,
          deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress.trim() : null,
          scheduleDate: scheduleDate || null,
          scheduleTime: scheduleTime || null,
          notes: notes.trim() || null,
          isSnackBoxPackage,
          snackBoxQuantity: isSnackBoxPackage ? Number(snackBoxQuantity) : 0,
          items: items.map((it) => ({
            productId: it.productId,
            name: it.name,
            variantId: it.variantId || null,
            quantity: it.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses pesanan.");
      }

      // Clear cart
      clearCart();

      // Store completed order info for rendering official receipt
      setCompletedOrder({
        orderCode: data.orderCode,
        totalAmount: data.totalAmount,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        fulfillmentType,
        deliveryAddress: deliveryAddress.trim(),
        scheduleDate,
        scheduleTime,
        notes: notes.trim(),
        createdAtFormatted: nowFormatted,
        items: orderItemsSnapshot,
        whatsappUrl: data.whatsappUrl,
      });

      // Automatically open WhatsApp in new tab
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================================================
  // VIEW: HASIL BUKTI TRANSAKSI & UCAPAN TERIMA KASIH (STRUK RESMI)
  // ==============================================================
  if (completedOrder) {
    const isDelivery = completedOrder.fulfillmentType === "DELIVERY";

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8 animate-fadeIn">
        {/* Banner Sukses Atas */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold text-amber-800 tracking-wider uppercase inline-block">
            Pemesanan Kue Berhasil Diproses
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Terima Kasih Banyak, {completedOrder.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Pesanan Anda telah tercatat rapi di dapur kami. Silakan simpan bukti transaksi resmi di bawah ini.
          </p>
        </div>

        {/* UCAPAN TERIMA KASIH KHUSUS DARI DAPUR RASA */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-50 via-white to-amber-50 rounded-3xl border-2 border-[#4A0E4E]/20 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-[#4A0E4E] font-bold text-sm">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <span>Ucapan Terima Kasih Spesial dari Dapur Rasa:</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            &ldquo;Terima kasih banyak telah memesan olahan kue rumahan kami! Setiap pesanan dari Anda adalah berkah dan motivasi bagi tim dapur kami untuk selalu menyajikan kue yang fresh, lezat, higienis, dan dibuat sepenuh hati untuk Anda dan keluarga.&rdquo;
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              {isDelivery
                ? "Pesanan Anda dijadwalkan untuk DIANTAR ke alamat Perum Griya Cileungsi 5."
                : "Pesanan Anda siap DIAMBIL SENDIRI di Dapur Toko (Perum Griya Cileungsi 5)."}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* HASIL BUKTI TRANSAKSI RESMI (INVOICE / DIGITAL RECEIPT)        */}
        {/* ============================================================== */}
        <div
          id="print-area"
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-xl space-y-5 print:border-none print:shadow-none"
        >
          {/* Header Bukti Transaksi */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-stone-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4A0E4E] text-white flex items-center justify-center font-bold text-xs">
                  <UtensilsCrossed className="w-4 h-4 text-amber-200" />
                </div>
                <span className="font-extrabold text-lg sm:text-xl font-heading text-[#4A0E4E]">
                  DAPUR RASA
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Kue &amp; Camilan Rumahan Kualitas Premium Fresh
              </p>
              <p className="text-[11px] text-stone-500">
                Perum Griya Cileungsi 5, Cileungsi, Bogor | WA: 085888159765
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                Bukti Transaksi Sah
              </span>
              <p className="text-xs font-mono font-bold text-stone-900 block">
                {completedOrder.orderCode}
              </p>
              <p className="text-[10px] text-stone-400">
                {completedOrder.createdAtFormatted}
              </p>
            </div>
          </div>

          {/* Info Pemesan & Status Ambil / Antar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-1">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Data Pemesan:
              </span>
              <p className="font-bold text-stone-900">{completedOrder.customerName}</p>
              <p className="text-stone-600 font-mono">{completedOrder.customerPhone}</p>
              {completedOrder.scheduleDate && (
                <p className="text-stone-600 text-[11px]">
                  Jadwal: {completedOrder.scheduleDate}{" "}
                  {completedOrder.scheduleTime ? `pukul ${completedOrder.scheduleTime}` : ""}
                </p>
              )}
            </div>

            <div className="space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-[#4A0E4E] block">
                Metode Pengantaran / Pengambilan:
              </span>
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                {isDelivery ? (
                  <>
                    <Truck className="w-4 h-4 text-[#4A0E4E]" />
                    <span>Dianterin Kurir ke Rumah</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span>Ambil Sendiri di Dapur Toko</span>
                  </>
                )}
              </div>
              {isDelivery ? (
                <div className="pt-1 text-[11px] text-stone-700">
                  <span className="font-semibold block text-stone-800">Alamat Pengantaran:</span>
                  <p className="leading-tight text-stone-600">{completedOrder.deliveryAddress}</p>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                    Area: Perum Griya Cileungsi 5
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 leading-tight">
                  Lokasi Ambil: Perum Griya Cileungsi 5 (Gratis Ongkir)
                </p>
              )}
              <div className="pt-1 text-[10px] text-stone-500">
                Status Bayar: <strong className="text-stone-800">Bayar saat Diterima (Tunai / COD)</strong>
              </div>
            </div>
          </div>

          {/* Rincian Produk Tabel */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Item Kue</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Harga</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedOrder.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-stone-900">{it.name}</span>
                      {it.variantName && (
                        <span className="text-amber-800 text-[10px] block">
                          Varian: {it.variantName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-stone-700">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-stone-600">
                      {formatPrice(it.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                      {formatPrice(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50/70 border-t border-stone-200 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-stone-500">
                    Subtotal Produk:
                  </td>
                  <td className="py-2 px-3 text-right">
                    {formatPrice(completedOrder.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-stone-500">
                    Ongkos Kirim ({isDelivery ? "Pengantaran Griya Cileungsi 5" : "Ambil Sendiri di Dapur"}):
                  </td>
                  <td className="py-2 px-3 text-right">
                    {formatPrice(completedOrder.shippingFee)}
                  </td>
                </tr>
                <tr className="border-t-2 border-stone-300 text-sm font-extrabold text-[#4A0E4E]">
                  <td colSpan={3} className="py-3 px-3">
                    TOTAL PEMBAYARAN:
                  </td>
                  <td className="py-3 px-3 text-right text-base">
                    {formatPrice(completedOrder.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Catatan Khusus Toko */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 block">
              Catatan Khusus Pemesanan &amp; Pengiriman:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-stone-500">
              <li>Seluruh kue diproduksi fresh tanpa bahan pengawet kimia berbahaya.</li>
              <li>Pengantaran kurir khusus melayani area Perum Griya Cileungsi 5 dan sekitarnya.</li>
              <li>Pembayaran dilakukan secara tunai / COD saat kue diambil atau tiba di rumah Anda.</li>
              {completedOrder.notes && (
                <li className="text-stone-800">
                  <strong>Catatan Anda:</strong> &ldquo;{completedOrder.notes}&rdquo;
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tombol Aksi Bukti Transaksi */}
        <div className="space-y-3">
          <a
            href={completedOrder.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg transition-all text-sm active:scale-98 cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span>Buka WhatsApp &amp; Konfirmasi Pesanan Sekarang</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="py-3 px-4 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
            >
              <Printer className="w-4 h-4 text-[#4A0E4E]" />
              <span>Cetak / Simpan Bukti Transaksi (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReceiptText}
              className="py-3 px-4 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
            >
              <Copy className="w-4 h-4 text-[#4A0E4E]" />
              <span>{isCopiedReceipt ? "Teks Bukti Tersalin!" : "Salin Rincian Bukti Transaksi"}</span>
            </button>
          </div>

          <Link
            href="/"
            className="w-full py-2.5 text-center text-xs font-bold text-stone-600 hover:text-[#4A0E4E] block transition-colors"
          >
            Kembali ke Halaman Beranda Toko
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW: FORM CHECKOUT SEBELUM PEMESANAN
  // ==============================================================
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="w-16 h-16 bg-purple-50 text-[#4A0E4E] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 font-heading mb-2">
          Keranjang Belanja Kosong
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Anda belum memilih produk kue untuk dicheckout.
        </p>
        <Link
          href="/produk"
          className="px-6 py-3 bg-[#4A0E4E] text-white text-sm font-semibold rounded-xl hover:bg-[#5C1261] transition"
        >
          Lihat Katalog Kue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16">
      <div className="mb-8">
        <span className="text-xs font-bold text-[#4A0E4E] tracking-wider uppercase">
          Proses Pemesanan Kue Dapur Rasa
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-heading mt-1">
          Form Pemesanan &amp; Konfirmasi
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Silakan lengkapi data pemesan, tentukan apakah pesanan ingin <strong>diambil sendiri di dapur</strong> atau <strong>diantar ke rumah</strong> (khusus area Perum Griya Cileungsi 5), serta sertakan alamat lengkap.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Data Kontak Pemesan</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Pemesan <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor WhatsApp Aktif <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Nomor WhatsApp untuk konfirmasi pesanan dan informasi saat kue siap.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: PERTANYAAN UTAMA: MAU DIAMBIL ATAU DIANTAR? */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-stone-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900">
                  Pesanan Mau Diambil Sendiri atau Diantar?
                </h2>
              </div>
              <p className="text-xs text-stone-500 pl-8">
                Tentukan cara penerimaan kue yang paling nyaman untuk Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Pilihan 1: Ambil Sendiri di Dapur */}
              <button
                type="button"
                onClick={() => setFulfillmentType("PICKUP")}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                  fulfillmentType === "PICKUP"
                    ? "border-[#4A0E4E] bg-purple-50/70 ring-2 ring-[#4A0E4E]/20 shadow-sm"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Store
                        className={`w-5 h-5 ${
                          fulfillmentType === "PICKUP" ? "text-[#4A0E4E]" : "text-stone-600"
                        }`}
                      />
                    </div>
                    {fulfillmentType === "PICKUP" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A0E4E] bg-white px-2 py-0.5 rounded-full shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-[#4A0E4E]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    Ambil Sendiri di Dapur
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Ambil langsung di dapur kami saat kue sudah matang / siap.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Biaya Kirim:</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    GRATIS (Rp 0)
                  </span>
                </div>
              </button>

              {/* Pilihan 2: Dianterin Kurir */}
              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                  fulfillmentType === "DELIVERY"
                    ? "border-[#4A0E4E] bg-purple-50/70 ring-2 ring-[#4A0E4E]/20 shadow-sm"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Truck
                        className={`w-5 h-5 ${
                          fulfillmentType === "DELIVERY" ? "text-[#4A0E4E]" : "text-stone-600"
                        }`}
                      />
                    </div>
                    {fulfillmentType === "DELIVERY" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A0E4E] bg-white px-2 py-0.5 rounded-full shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-[#4A0E4E]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    Dianterin ke Rumah
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Kurir kami mengantar langsung kue fresh ke rumah Anda.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Khusus Wilayah:</span>
                  <span className="font-bold text-[#4A0E4E] bg-purple-100 px-2 py-0.5 rounded-md text-[11px]">
                    Perum Griya Cileungsi 5
                  </span>
                </div>
              </button>
            </div>

            {/* FORM ALAMAT PENGANTARAN LENGKAP JIKA MEMILIH DIANTAR */}
            {fulfillmentType === "DELIVERY" ? (
              <div className="pt-4 space-y-4 animate-fadeIn border-t border-stone-200">
                <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs text-[#4A0E4E] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-[#4A0E4E]" />
                    <span>Mohon Sertakan Alamat Lengkap Pengantaran</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Pengantaran kurir langsung melayani area <strong>Perum Griya Cileungsi 5</strong> dan sekitarnya agar pesanan tiba dalam keadaan hangat dan fresh.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Alamat Lengkap di Perum Griya Cileungsi 5 <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Tuliskan: Blok Rumah, Nomor Rumah, RT/RW, dan patokan (misal: Perum Griya Cileungsi 5 Blok C2 No. 15, RT 03/RW 09, dekat Pos Satpam / Masjid Al-Ikhlas)"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E] shadow-xs"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Semakin detail alamat dan patokan yang Anda sertakan, semakin cepat kurir kami mengantarkan pesanan.
                  </span>
                </div>

                {/* Option for Snack Box Package (> 50 box requirement) */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="snackbox-check"
                      checked={isSnackBoxPackage}
                      onChange={(e) => setIsSnackBoxPackage(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-[#4A0E4E] focus:ring-[#4A0E4E] cursor-pointer"
                    />
                    <label htmlFor="snackbox-check" className="text-xs text-amber-950 cursor-pointer">
                      <span className="font-bold block text-sm">
                        Request Pesanan Paket Snack Box Acara / Rapat?
                      </span>
                      <span className="text-stone-600 block text-[11px] mt-0.5">
                        Centang opsi ini jika Anda memesan snack box untuk kebutuhan acara arisan, pengajian, hajatan, atau rapat kantor.
                        <strong className="text-amber-900 block mt-0.5">
                          Ketentuan pengantaran paket box: Minimal harus lebih dari 50 box (&gt; 50 box).
                        </strong>
                      </span>
                    </label>
                  </div>

                  {isSnackBoxPackage && (
                    <div className="pt-2 pl-7 animate-fadeIn space-y-2">
                      <label className="block text-xs font-bold text-amber-950">
                        Jumlah Pesanan Paket Box (Wajib &gt; 50):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={51}
                          value={snackBoxQuantity}
                          onChange={(e) => setSnackBoxQuantity(Number(e.target.value))}
                          className="w-32 px-3 py-1.5 rounded-xl border border-amber-300 text-sm font-bold text-stone-900 bg-white"
                        />
                        <span className="text-xs text-stone-600 font-medium">Box / Paket</span>
                      </div>
                      {snackBoxQuantity <= 50 && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Jumlah paket box harus lebih dari 50 box untuk opsi ini.</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-3 space-y-2 animate-fadeIn border-t border-stone-100">
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-800 block">
                      Informasi Pengambilan Sendiri di Dapur:
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Lokasi dapur kami beralamat di <strong>Perum Griya Cileungsi 5</strong>. Setelah pesanan selesai dibuat fresh, Anda akan kami hubungi via WhatsApp untuk konfirmasi pengambilan. Tidak dikenakan ongkos kirim.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Schedule & Notes */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Waktu Pemesanan &amp; Catatan Khusus</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tanggal Pesanan Diinginkan</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Estimasi Jam Ambil / Antar</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Catatan Khusus Pesanan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Sambal rawit dipisah, kemasan mika per 5 pcs, untuk suguhan tamu arisan..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-lg sticky top-24 space-y-5">
            <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Ringkasan Belanja</span>
              <span className="text-xs font-bold text-[#4A0E4E] bg-purple-50 px-2.5 py-1 rounded-full">
                {items.length} Menu Kue
              </span>
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-3">
                    <span className="font-semibold text-stone-800 block text-xs sm:text-sm">
                      {item.name}
                    </span>
                    {item.variantName && (
                      <span className="text-[11px] text-[#4A0E4E] font-medium">
                        ({item.variantName})
                      </span>
                    )}
                    <span className="text-stone-400 block mt-0.5">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-stone-600 items-center">
                <span>Metode Penerimaan</span>
                <span className="font-bold text-[#4A0E4E]">
                  {fulfillmentType === "DELIVERY"
                    ? "Dianterin ke Rumah"
                    : "Ambil Sendiri di Dapur"}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Ongkos Kirim</span>
                <span className="font-bold text-stone-800">
                  {fulfillmentType === "DELIVERY"
                    ? `${formatPrice(defaultShippingFee)} (Griya Cileungsi 5)`
                    : "Gratis (Rp 0)"}
                </span>
              </div>

              <div className="flex justify-between text-stone-600 items-center">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Bayar saat Diterima (Tunai / COD)
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-bold text-stone-900 pt-3 border-t border-stone-100">
                <span>Total Pembayaran</span>
                <span className="text-lg sm:text-xl font-heading text-[#4A0E4E]">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Notice COD / Bayar saat diterima */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Pesan Sekarang, Bayar Saat Diterima</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Anda tidak perlu melakukan transfer bank. Cukup klik tombol di bawah untuk mengirimkan pesanan ke WhatsApp toko. Pembayaran tunai dilakukan saat Anda mengambil kue di dapur atau saat kurir tiba di rumah.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 shadow-lg transition-all text-sm sm:text-base ${
                isSubmitting
                  ? "bg-stone-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] cursor-pointer"
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>{isSubmitting ? "Memproses Pesanan..." : "Kirim Pesanan via WhatsApp"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

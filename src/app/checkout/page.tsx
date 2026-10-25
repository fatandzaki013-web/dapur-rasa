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
  Printer,
  UtensilsCrossed,
  MapPin,
  Check,
  CreditCard,
  Wallet,
  Building2,
  Sparkles,
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
  paymentMethodLabel: string;
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
  const { formatPrice } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER_BANK">("COD");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [notes, setNotes] = useState("");

  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed order data for rendering official receipt
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  // Free Ongkir untuk Griya Cileungsi 5
  const shippingFee = 0;
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
    ? `• Status: DIANTAR KE ALAMAT RUMAH\n• Alamat Lengkap: ${completedOrder.deliveryAddress || "Perum Griya Cileungsi 5"}\n• Ketentuan Ongkir: Free Ongkir Griya Cileungsi 5 / Luar Area Cek Jarak`
    : "• Status: AMBIL SENDIRI DI DAPUR TOKO (Perum Griya Cileungsi 5)"
}

PILIHAN PEMBAYARAN:
• Metode Bayar : ${completedOrder.paymentMethodLabel}
${completedOrder.scheduleDate ? `• Jadwal Waktu : ${completedOrder.scheduleDate} ${completedOrder.scheduleTime ? `pukul ${completedOrder.scheduleTime}` : ""}\n` : ""}
${completedOrder.notes ? `• Catatan Khusus: ${completedOrder.notes}\n` : ""}
RINCIAN PESANAN KUE:
${itemsList}

Subtotal      : ${formatPrice(completedOrder.subtotal)}
Ongkos Kirim  : GRATIS (Free Ongkir Griya Cileungsi 5)
TOTAL TAGIHAN : ${formatPrice(completedOrder.totalAmount)}
====================================
Terima kasih banyak telah memesan di Dapur Rasa!
Pesanan Anda dibuat fresh dengan sepenuh hati.
====================================`;

    navigator.clipboard.writeText(receiptText);
    setIsCopiedReceipt(true);
    setTimeout(() => setIsCopiedReceipt(false), 2500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    if (fulfillmentType === "DELIVERY" && !deliveryAddress.trim()) {
      setErrorMessage("Mohon cantumkan alamat lengkap pengantaran (misal Blok/No Rumah di Perum Griya Cileungsi 5).");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Keranjang pesanan Anda masih kosong.");
      return;
    }

    setIsSubmitting(true);

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
          paymentMethod,
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

      clearCart();

      setCompletedOrder({
        orderCode: data.orderCode,
        totalAmount: data.totalAmount,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee ?? 0,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        fulfillmentType,
        deliveryAddress: deliveryAddress.trim(),
        scheduleDate,
        scheduleTime,
        paymentMethodLabel:
          paymentMethod === "COD"
            ? "Bayar Tunai saat Diterima (COD)"
            : "Transfer Bank / QRIS",
        notes: notes.trim(),
        createdAtFormatted: nowFormatted,
        items: orderItemsSnapshot,
        whatsappUrl: data.whatsappUrl,
      });

      if (data.whatsappUrl) {
        // Direct navigation opens WhatsApp app roomchat immediately with prefilled message
        window.location.href = data.whatsappUrl;
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
            Pesanan Anda telah tercatat rapi di dapur kami dan diteruskan ke WhatsApp toko. Silakan simpan bukti transaksi resmi di bawah ini.
          </p>
        </div>

        {/* Tampilan Struk Resmi */}
        <div className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4A0E4E] text-white flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-stone-900">Dapur Rasa</h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                    Kue Rumahan &amp; Frozen Food
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Kode Transaksi
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-[#4A0E4E]">
                {completedOrder.orderCode}
              </span>
            </div>
          </div>

          {/* Rincian Pemesan & Pengantaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-0.5">
                Data Pemesan:
              </span>
              <p className="font-bold text-stone-900">{completedOrder.customerName}</p>
              <p className="text-stone-600">{completedOrder.customerPhone}</p>
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-0.5">
                Metode Penerimaan:
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#4A0E4E]">
                {isDelivery ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>
                  {isDelivery ? "Diantar ke Rumah" : "Ambil Sendiri di Dapur Toko"}
                </span>
              </div>
              {isDelivery && completedOrder.deliveryAddress && (
                <p className="text-[11px] text-stone-600 mt-1">
                  Alamat: {completedOrder.deliveryAddress}
                </p>
              )}
            </div>
          </div>

          {/* Tabel Pesanan */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 block">Daftar Menu:</span>
            <div className="space-y-2">
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-stone-100 last:border-0">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-stone-800">{it.name}</span>
                    {it.variantName && (
                      <span className="text-[10px] text-[#4A0E4E] ml-1">({it.variantName})</span>
                    )}
                    <span className="text-stone-400 block text-[11px]">{it.quantity} × {formatPrice(it.price)}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-stone-800">{formatPrice(completedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Ongkos Kirim</span>
              <span>GRATIS (Free Ongkir Griya Cileungsi 5)</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Pembayaran</span>
              <span className="text-[#4A0E4E] font-heading">{formatPrice(completedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {completedOrder.whatsappUrl && (
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              <span>Buka Kembali Chat WhatsApp Toko</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopyReceiptText}
              className="py-3 px-4 rounded-xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              {isCopiedReceipt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Teks Struk Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Salin Teks Struk Resmi</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintReceipt}
              className="py-3 px-4 rounded-xl border-2 border-[#4A0E4E] bg-purple-50 hover:bg-purple-100 text-[#4A0E4E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#4A0E4E]" />
              <span>Cetak / Simpan PDF Struk</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#4A0E4E] hover:underline"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama Dapur Rasa</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW: KERANJANG KOSONG
  // ==============================================================
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fadeIn">
        <div className="w-20 h-20 bg-purple-50 text-[#4A0E4E] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 font-heading">
          Keranjang Belanja Anda Masih Kosong
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Silakan pilih kue favorit Anda terlebih dahulu dari katalog produk kami sebelum melanjutkan ke checkout.
        </p>
        <div className="pt-2">
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lanjutkan Belanja Produk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW: FORMULIR CHECKOUT RAPI & SEDERHANA (STREAMLINED)
  // ==============================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* Tombol Lanjutkan Belanja Cepat */}
      <div className="mb-4">
        <Link
          href="/produk"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0E4E] hover:underline bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200/60 transition"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>← Ingin Tambah Kue Lain? Lanjutkan Belanja</span>
        </Link>
      </div>

      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Checkout &amp; Konfirmasi Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Lengkapi data singkat di bawah ini. Pesanan Anda akan langsung otomatis terhubung ke WhatsApp toko kami.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Mohon Periksa Kembali:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Form Details Sederhana */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Kontak Pemesan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Data Kontak Pemesan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              </div>
            </div>
          </div>

          {/* Section 2: Pilihan Pengantaran & Alamat */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Metode Pengambilan / Pengantaran</span>
            </h2>

            {/* Pilihan 2 Kartu: Diantar vs Ambil Sendiri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi 1: Diantar ke Alamat */}
              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  fulfillmentType === "DELIVERY"
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Truck className="w-5 h-5" />
                    </div>
                    {fulfillmentType === "DELIVERY" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-700" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Diantar ke Rumah
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Kurir mengantar langsung pesanan kue fresh ke depan rumah Anda.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-xs">
                  <span className="text-stone-500 text-[11px]">Griya Cileungsi 5:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10.5px]">
                    FREE ONGKIR
                  </span>
                </div>
              </button>

              {/* Opsi 2: Ambil Sendiri di Dapur */}
              <button
                type="button"
                onClick={() => setFulfillmentType("PICKUP")}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  fulfillmentType === "PICKUP"
                    ? "border-[#4A0E4E] bg-purple-50/70 ring-2 ring-[#4A0E4E]/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#4A0E4E]">
                      <Store className="w-5 h-5" />
                    </div>
                    {fulfillmentType === "PICKUP" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A0E4E] bg-purple-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-[#4A0E4E]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Ambil Sendiri di Dapur
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Ambil langsung di dapur toko kami saat kue sudah matang.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-purple-200/50 flex items-center justify-between text-xs">
                  <span className="text-stone-500 text-[11px]">Biaya:</span>
                  <span className="font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[10.5px]">
                    GRATIS (Rp 0)
                  </span>
                </div>
              </button>
            </div>

            {/* Info Sopan Free Ongkir Griya Cileungsi 5 */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center gap-2 text-sm text-emerald-900">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Ketentuan Pengantaran &amp; Gratis Ongkir:</span>
              </div>
              <p className="leading-relaxed text-emerald-900 font-semibold text-xs">
                🎉 <strong>Gratis Ongkos Kirim (Free Ongkir)</strong> khusus untuk seluruh pengantaran di area <strong>Perumahan Griya Cileungsi 5</strong>.
              </p>
              <p className="leading-relaxed text-stone-600 text-[11.5px]">
                Untuk pengantaran ke <strong>luar area Griya Cileungsi 5</strong>, tarif ongkos kirim akan disesuaikan secara terjangkau berdasarkan jarak lokasi Anda via kurir/ojek online.
              </p>
            </div>

            {/* Input Alamat jika diantar */}
            {fulfillmentType === "DELIVERY" && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Alamat Lengkap Pengantaran <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Tuliskan: Blok Rumah, Nomor Rumah, RT/RW, dan patokan (misal: Griya Cileungsi 5 Blok C2 No. 15, dekat Masjid Al-Ikhlas)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Section 3: Pembayaran & Catatan Tambahan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Pilihan Pembayaran &amp; Catatan Khusus</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COD */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    Bayar Tunai saat Diterima (COD)
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                    Bayar langsung saat kue tiba di rumah Anda.
                  </p>
                </div>
              </label>

              {/* Transfer / QRIS */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "TRANSFER_BANK"
                    ? "border-[#4A0E4E] bg-purple-50/60 ring-2 ring-[#4A0E4E]/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TRANSFER_BANK"
                  checked={paymentMethod === "TRANSFER_BANK"}
                  onChange={() => setPaymentMethod("TRANSFER_BANK")}
                  className="mt-0.5 h-4 w-4 text-[#4A0E4E] focus:ring-[#4A0E4E] cursor-pointer"
                />
                <div>
                  <span className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#4A0E4E]" />
                    Transfer Bank / QRIS
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                    Nomor rekening / QRIS akan dikirim via chat WhatsApp.
                  </p>
                </div>
              </label>
            </div>

            {/* Jadwal & Catatan */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tanggal Diinginkan (Opsional)</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Estimasi Jam Pengantaran (Opsional)</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Catatan Tambahan Pesanan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tolong kirim hangat sebelum jam 10 pagi, tambahkan cabai rawit hijau ekstra, dll."
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & WhatsApp Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-lg sticky top-24 space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Ringkasan Belanja</span>
              <span className="text-xs font-bold text-[#4A0E4E] bg-purple-50 px-2.5 py-1 rounded-full">
                {items.length} Menu
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
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600">Ongkos Kirim</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {fulfillmentType === "DELIVERY"
                    ? "Free Ongkir (Griya Cileungsi 5)"
                    : "Gratis Rp 0 (Ambil Sendiri)"}
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-bold text-stone-900 pt-2.5 border-t border-stone-100">
                <span>Total Pembayaran</span>
                <span className="text-lg sm:text-xl font-heading text-[#4A0E4E]">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* WhatsApp Integration Notice */}
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pesan Cepat Otomatis ke WhatsApp</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Rincian pesanan dan alamat Anda akan langsung tersusun rapi di WhatsApp toko kami untuk segera dikonfirmasi.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 shadow-lg transition-all text-sm sm:text-base cursor-pointer ${
                isSubmitting
                  ? "bg-stone-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>{isSubmitting ? "Memproses Pesanan..." : "Pesan Sekarang via WhatsApp"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

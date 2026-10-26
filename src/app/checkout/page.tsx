"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Phone,
  CheckCircle,
  Store,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Copy,
  Printer,
  UtensilsCrossed,
  MapPin,
  Check,
  CreditCard,
  QrCode,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  User,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  FileText,
} from "lucide-react";

const STORE_OFFICIAL_ADDRESS = "Perumahan Griya Cileungsi 5 Blok A8 No. 01";

interface CompletedOrderInfo {
  orderCode: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethodLabel: string;
  notes: string;
  createdAtFormatted: string;
  items: Array<{
    name: string;
    variantName?: string | null;
    quantity: number;
    price: number;
    imageUrl?: string | null;
  }>;
  whatsappUrl: string;
}

export default function CheckoutPage() {
  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { formatPrice, settings } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed order data for rendering official receipt
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  const brandName = settings?.brandName || "Dapur Rasa";
  const brandTagline = settings?.tagline || "Kue Rumahan Kualitas Premium Fresh";

  const shippingFee = 0;
  const totalAmount = subtotal + shippingFee;

  const handleCopyBank = (accountNumber: string, bankName: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(accountNumber);
        setCopiedBank(bankName);
        setTimeout(() => setCopiedBank(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

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
BUKTI TRANSAKSI RESMI - ${brandName.toUpperCase()}
${brandTagline}
====================================
No. Referensi : ${completedOrder.orderCode}
Tanggal Waktu : ${completedOrder.createdAtFormatted}
Nama Pemesan  : ${completedOrder.customerName}
No. WhatsApp  : ${completedOrder.customerPhone}

LOKASI DAPUR TOKO:
• Alamat Resmi: ${STORE_OFFICIAL_ADDRESS}

METODE PEMBAYARAN:
• Pembayaran  : Transfer Bank & QRIS All Payment
${completedOrder.notes ? `• Catatan     : ${completedOrder.notes}\n` : ""}
RINCIAN PESANAN KUE:
${itemsList}

Subtotal      : ${formatPrice(completedOrder.subtotal)}
Ongkos Kirim  : GRATIS (Free Ongkir)
TOTAL TAGIHAN : ${formatPrice(completedOrder.totalAmount)}
====================================
Terima kasih banyak telah memesan di ${brandName}!
Pesanan Anda disiapkan fresh dengan sepenuh hati.
====================================`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(receiptText);
        setIsCopiedReceipt(true);
        setTimeout(() => setIsCopiedReceipt(false), 2500);
      }
    } catch {
      // Fallback
    }
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
      setErrorMessage("Nomor WhatsApp minimal 9 digit angka (contoh: 08123456789).");
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
      imageUrl: it.imageUrl || null,
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
          fulfillmentType: "PICKUP",
          deliveryAddress: STORE_OFFICIAL_ADDRESS,
          notes: notes.trim() || null,
          paymentMethod: "TRANSFER_BANK_QRIS",
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

      // Kosongkan keranjang di state dan localStorage seketika
      clearCart();
      try {
        localStorage.removeItem("dr_cart_items_v1");
        localStorage.setItem("dr_cart_items_v1", "[]");
      } catch (e) {
        // Fallback
      }

      setCompletedOrder({
        orderCode: data.orderCode,
        totalAmount: data.totalAmount,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee ?? 0,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: STORE_OFFICIAL_ADDRESS,
        paymentMethodLabel: "Transfer Bank / QRIS",
        notes: notes.trim(),
        createdAtFormatted: nowFormatted,
        items: orderItemsSnapshot,
        whatsappUrl: data.whatsappUrl,
      });

      if (data.whatsappUrl) {
        // Langsung arahkan otomatis masuk ke WhatsApp penjual!
        window.location.href = data.whatsappUrl;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================================================
  // VIEW: HASIL BUKTI TRANSAKSI & STRUK RESMI SETELAH CHECKOUT
  // ==============================================================
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Banner Sukses Atas */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <span className="text-xs font-bold text-amber-800 tracking-wider uppercase inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Pesanan Berhasil Tercatat
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Terima Kasih, {completedOrder.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Pesanan Anda otomatis diarahkan ke WhatsApp penjual. Jika ruang chat belum terbuka otomatis, silakan klik tombol hijau di bawah ini.
          </p>
        </div>

        {/* Tampilan Struk Resmi */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-5 sm:p-8 space-y-6">
          {/* Header Struk */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-5 gap-3">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="w-11 h-11 object-contain rounded-xl border border-stone-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#4A0E4E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <UtensilsCrossed className="w-6 h-6 text-amber-200" />
                </div>
              )}
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight">
                  {brandName}
                </h2>
                <p className="text-[11px] text-stone-500 font-medium">
                  {brandTagline}
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-stone-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Kode Transaksi
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-[#4A0E4E]">
                {completedOrder.orderCode}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {completedOrder.createdAtFormatted}
              </span>
            </div>
          </div>

          {/* Rincian Pemesan & Alamat Toko */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/90">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Data Pemesan:
              </span>
              <p className="font-bold text-stone-900 text-sm">{completedOrder.customerName}</p>
              <p className="text-stone-600 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{completedOrder.customerPhone}</span>
              </p>
              {completedOrder.notes && (
                <p className="text-stone-500 text-[11px] mt-1.5 italic">
                  Catatan: {completedOrder.notes}
                </p>
              )}
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Alamat Dapur &amp; Lokasi Toko:
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#4A0E4E]">
                <Store className="w-4 h-4 text-[#4A0E4E]" />
                <span>{STORE_OFFICIAL_ADDRESS}</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-1 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                Pembayaran: Transfer Bank &amp; QRIS
              </p>
            </div>
          </div>

          {/* Daftar Produk dengan Foto Jelas & Rapi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Daftar Menu yang Dipesan:
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {completedOrder.items.reduce((acc, it) => acc + it.quantity, 0)} Item
              </span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl overflow-hidden bg-white">
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 sm:p-3.5 hover:bg-stone-50/50 transition">
                  {/* Thumbnail Foto Produk */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 shadow-2xs">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </div>

                  {/* Info Produk */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug">
                      {it.name}
                    </h4>
                    {it.variantName && (
                      <span className="inline-block text-[10px] font-semibold text-[#4A0E4E] bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded mt-0.5">
                        {it.variantName}
                      </span>
                    )}
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {it.quantity} × {formatPrice(it.price)}
                    </div>
                  </div>

                  {/* Subtotal Item */}
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Total */}
          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-stone-800">{formatPrice(completedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total Tagihan</span>
              <span className="text-[#4A0E4E] font-heading font-black text-lg sm:text-xl">
                {formatPrice(completedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Kotak Rekening & QRIS */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#4A0E4E] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#4A0E4E]" />
                <span>Rincian Pembayaran Transfer &amp; QRIS:</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Transfer Bank / QRIS
              </span>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11.5px]">
              Pembayaran dapat dilakukan melalui Transfer Bank BCA atau QRIS All Payment:
            </p>
            <div className="bg-white p-3 rounded-xl border border-purple-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-stone-900 block text-xs">Bank BCA</span>
                <span className="font-mono font-black text-[#4A0E4E] text-sm">7310-982-120</span>
                <span className="text-[10px] text-stone-500 block">a.n. Dapur Rasa / Mama Fatan</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyBank("7310982120", "BCA")}
                className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-xs font-bold text-[#4A0E4E] hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedBank === "BCA" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 italic">
              *Tersedia QRIS All Payment (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA). Kirimkan bukti transfer via chat WhatsApp toko.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {completedOrder.whatsappUrl && (
            <a
              href={completedOrder.whatsappUrl}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base cursor-pointer hover:shadow-xl active:scale-[0.99]"
            >
              <Phone className="w-5 h-5" />
              <span>Buka Ruang Chat WhatsApp Penjual Sekarang</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopyReceiptText}
              className="py-3 px-4 rounded-xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {isCopiedReceipt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Teks Struk Tersalin!</span>
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
              className="py-3 px-4 rounded-xl border-2 border-[#4A0E4E] bg-purple-50 hover:bg-purple-100 text-[#4A0E4E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
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
              <span>Kembali ke Halaman Utama {brandName}</span>
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
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-36 pb-20 text-center space-y-5 animate-fadeIn">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 text-[#4A0E4E] rounded-full flex items-center justify-center mx-auto shadow-inner border border-purple-100">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Keranjang Belanja Masih Kosong
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            Silakan pilih kue lezat atau frozen food favorit Anda dari katalog kami terlebih dahulu sebelum melakukan checkout.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-extrabold rounded-2xl text-sm shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mulai Pilih Menu Kue Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW: FORMULIR CHECKOUT RAPI & SEDERHANA
  // ==============================================================
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-28 lg:pb-16 animate-fadeIn">
      {/* Top Breadcrumb & Link Kembali */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <Link href="/" className="hover:text-stone-800 transition">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/produk" className="hover:text-stone-800 transition">Katalog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-bold text-stone-800">Checkout Pesanan</span>
        </div>

        <Link
          href="/produk"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A0E4E] hover:underline bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200/60 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tambah Menu Lain</span>
        </Link>
      </div>

      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Checkout &amp; Konfirmasi Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed max-w-2xl">
          Lengkapi nama dan kontak pemesan. Pesanan Anda akan langsung otomatis terhubung ke WhatsApp dapur toko kami.
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

      <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ============================================================== */}
        {/* LEFT COLUMN: DATA KONTAK, ALAMAT TOKO, & METODE PEMBAYARAN */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Kontak Pemesan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                1
              </span>
              <span>Data Kontak Pemesan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nama Lengkap Pemesan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E] transition bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E] transition bg-white"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Nomor aktif untuk konfirmasi pesanan via WhatsApp.
                </p>
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
                placeholder="Misal: Tolong kirim hangat sebelum jam 10 pagi, sambal cabai rawit ekstra, dll."
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 bg-white"
              />
            </div>
          </div>

          {/* Section 2: Alamat & Lokasi Dapur Kami */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3.5">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                2
              </span>
              <span>Alamat Dapur &amp; Lokasi Toko Kami</span>
            </h2>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[#4A0E4E] shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-stone-900">
                      {STORE_OFFICIAL_ADDRESS}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      Lokasi Resmi
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Seluruh olahan kue rumahan, aneka pastel crispy, dan frozen food disiapkan fresh setiap hari langsung dari dapur toko kami di alamat ini.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Informasi Pembayaran (Transfer Bank & QRIS) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3.5">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                3
              </span>
              <span>Metode Pembayaran: Transfer Bank &amp; QRIS</span>
            </h2>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
              <p className="text-xs text-stone-700 leading-relaxed">
                Pembayaran pesanan dapat dilakukan dengan mudah melalui <strong>Transfer Bank BCA</strong> atau <strong>QRIS All Payment</strong>:
              </p>

              {/* Box Rekening BCA */}
              <div className="bg-white p-3.5 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block uppercase">Bank BCA</span>
                  <span className="font-mono font-black text-stone-900 text-sm sm:text-base tracking-wider">
                    7310-982-120
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    a.n. Dapur Rasa / Mama Fatan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyBank("7310982120", "BCA_FORM")}
                  className="px-3.5 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-xs font-bold text-[#4A0E4E] hover:bg-purple-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedBank === "BCA_FORM" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin No. Rekening</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keterangan QRIS */}
              <div className="flex items-center gap-2 text-xs text-purple-900 bg-purple-100/70 p-2.5 rounded-xl">
                <QrCode className="w-4 h-4 text-[#4A0E4E] shrink-0" />
                <span>
                  <strong>Tersedia QRIS All Payment:</strong> BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA.
                </span>
              </div>

              <p className="text-[11px] text-stone-500 leading-tight italic">
                💡 Bukti transfer atau konfirmasi QRIS dapat Anda kirimkan langsung saat chat WhatsApp toko kami terbuka.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: RINGKASAN PESANAN DENGAN FOTO PRODUK (5 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-lg lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* Header Ringkasan */}
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-base text-stone-900">
                  Rincian Belanja
                </h2>
                <p className="text-[11px] text-stone-500">
                  Cek foto dan jumlah pesanan Anda
                </p>
              </div>
              <span className="text-xs font-bold text-[#4A0E4E] bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-full">
                {totalItems} Menu Dipilih
              </span>
            </div>

            {/* DAFTAR PRODUK (TIDAK TERPOTONG, ADA FOTO JELAS & KONTROL KUANTITAS) */}
            <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1 space-y-3 divide-y divide-stone-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex gap-3 items-center group"
                >
                  {/* Foto Produk Jelas Tanpa Terpotong */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 shadow-2xs relative">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-50 ${
                        item.imageUrl ? "hidden" : "flex"
                      }`}
                    >
                      <ShoppingBag className="w-6 h-6 stroke-1" />
                    </div>
                  </div>

                  {/* Info Produk, Varian, & Pengaturan Jumlah */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2">
                      {item.name}
                    </h3>

                    {item.variantName && (
                      <span className="inline-block text-[10.5px] font-semibold text-[#4A0E4E] bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md">
                        {item.variantName}
                      </span>
                    )}

                    <div className="text-[11px] text-stone-500 font-medium">
                      {formatPrice(item.price)} / {item.unit || "porsi"}
                    </div>

                    {/* Kontrol Kuantitas Langsung di Halaman Checkout */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs h-7">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 h-full hover:bg-stone-100 text-stone-600 transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 h-full hover:bg-stone-100 text-stone-600 transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition cursor-pointer"
                          aria-label={`Hapus ${item.name}`}
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rincian Perhitungan Biaya */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({totalItems} item)</span>
                <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-stone-600">
                <span>Pembayaran</span>
                <span className="font-bold text-[#4A0E4E] bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                  Transfer Bank / QRIS
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-900 pt-3 border-t border-stone-100">
                <span>Total Tagihan</span>
                <span className="text-xl sm:text-2xl font-heading font-black text-[#4A0E4E]">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Jaminan WhatsApp Otomatis */}
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Pesan Cepat Otomatis ke WhatsApp</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Rincian pesanan dan alamat dapur Anda langsung terhubung ke WhatsApp toko untuk konfirmasi cepat.
              </p>
            </div>

            {/* Tombol Utama Kirim Pesanan */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-white flex items-center justify-center gap-2.5 shadow-lg transition-all text-sm sm:text-base cursor-pointer ${
                isSubmitting
                  ? "bg-stone-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.99]"
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>{isSubmitting ? "Membuka WhatsApp..." : "Checkout & Pesan via WhatsApp"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Keamanan & Garansi Toko */}
            <div className="pt-1 flex items-center justify-center gap-4 text-[10.5px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Higienis &amp; Fresh
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Rasa Terjamin
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* ============================================================== */}
      {/* MOBILE FLOATING BOTTOM BAR (AGAR FITUR TIDAK PERNAH TERPOTONG) */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 px-4">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">
              Total ({totalItems} Menu):
            </span>
            <span className="font-extrabold text-base sm:text-lg text-[#4A0E4E] font-heading">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className={`px-5 py-3 rounded-xl font-bold text-white text-xs sm:text-sm flex items-center gap-2 shadow-md shrink-0 cursor-pointer ${
              isSubmitting ? "bg-stone-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{isSubmitting ? "Membuka..." : "Checkout via WA"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

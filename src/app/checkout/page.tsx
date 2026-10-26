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
  Plus,
  Minus,
  Trash2,
  QrCode,
  User,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Tag,
  ArrowLeft,
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
  paymentMethod: "COD" | "TRANSFER_BANK";
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
  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER_BANK">("COD");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [notes, setNotes] = useState("");

  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed order data for rendering official receipt
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  const brandName = settings?.brandName || "Dapur Rasa";
  const brandTagline = settings?.tagline || "Kue Rumahan Kualitas Premium Fresh";
  const brandAddress = settings?.address || "Perumahan Griya Cileungsi 5";

  // Free Ongkir untuk Griya Cileungsi 5
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

METODE PENERIMAAN:
${
  completedOrder.fulfillmentType === "DELIVERY"
    ? `• Status: DIANTAR KE ALAMAT RUMAH\n• Alamat Lengkap: ${completedOrder.deliveryAddress || brandAddress}\n• Ketentuan Ongkir: Free Ongkir Area Griya Cileungsi 5`
    : `• Status: AMBIL SENDIRI DI DAPUR TOKO (${brandAddress})`
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
Terima kasih banyak telah memesan di ${brandName}!
Pesanan Anda dibuat fresh dengan sepenuh hati.
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
        paymentMethod,
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
  // VIEW: HASIL BUKTI TRANSAKSI & UCAPAN TERIMA KASIH (STRUK RESMI)
  // ==============================================================
  if (completedOrder) {
    const isDelivery = completedOrder.fulfillmentType === "DELIVERY";

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

          {/* Rincian Pemesan & Pengantaran */}
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
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Metode Penerimaan:
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#4A0E4E]">
                {isDelivery ? <Truck className="w-4 h-4 text-emerald-600" /> : <Store className="w-4 h-4 text-[#4A0E4E]" />}
                <span>
                  {isDelivery ? "Diantar ke Rumah (Kurir Toko)" : "Ambil Sendiri di Dapur Toko"}
                </span>
              </div>
              {isDelivery && completedOrder.deliveryAddress && (
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed bg-white p-2 rounded-lg border border-stone-200/80">
                  <span className="font-semibold text-stone-700">Alamat:</span> {completedOrder.deliveryAddress}
                </p>
              )}
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
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Ongkos Kirim</span>
              </span>
              <span className="bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                GRATIS (Free Ongkir Griya Cileungsi 5)
              </span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total Tagihan</span>
              <span className="text-[#4A0E4E] font-heading font-black text-lg sm:text-xl">
                {formatPrice(completedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Petunjuk Pembayaran jika Transfer Bank */}
          {completedOrder.paymentMethod === "TRANSFER_BANK" && (
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#4A0E4E] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#4A0E4E]" />
                  <span>Informasi Rekening Pembayaran:</span>
                </div>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Transfer Bank / QRIS
                </span>
              </div>
              <p className="text-stone-700 leading-relaxed text-[11.5px]">
                Silakan lakukan transfer pembayaran ke salah satu rekening resmi kami di bawah ini:
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
                *Kirimkan bukti transfer via chat WhatsApp toko untuk konfirmasi instan.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {completedOrder.whatsappUrl && (
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base cursor-pointer hover:shadow-xl active:scale-[0.99]"
            >
              <Phone className="w-5 h-5" />
              <span>Buka Kembali Chat WhatsApp Toko</span>
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
  // VIEW: FORMULIR CHECKOUT RAPI & LENGKAP DENGAN GAMBAR PRODUK
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
          Lengkapi data alamat dan kontak pemesan. Pesanan akan otomatis terhubung ke WhatsApp dapur toko kami untuk langsung dipersiapkan secara fresh.
        </p>

        {/* Alur Langkah Sederhana */}
        <div className="flex items-center gap-2 sm:gap-3 mt-4 text-[11px] sm:text-xs font-bold text-stone-500 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>1. Pilih Menu ({totalItems})</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
          <div className="flex items-center gap-1.5 text-[#4A0E4E] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 shrink-0">
            <span className="w-4 h-4 rounded-full bg-[#4A0E4E] text-white text-[10px] flex items-center justify-center font-bold">2</span>
            <span>2. Rincian &amp; Pengantaran</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
          <div className="flex items-center gap-1.5 text-stone-400 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-600 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>3. Konfirmasi WhatsApp</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Mohon Periksa Kembali Formulir:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ============================================================== */}
        {/* LEFT COLUMN: FORM DETAILS LENGKAP & RAPI (7 COLS) */}
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
                  Nomor aktif untuk konfirmasi pengantaran via WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Pilihan Pengantaran & Alamat */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                2
              </span>
              <span>Metode Pengambilan / Pengantaran</span>
            </h2>

            {/* Pilihan 2 Kartu: Diantar vs Ambil Sendiri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Opsi 1: Diantar ke Alamat */}
              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  fulfillmentType === "DELIVERY"
                    ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Truck className="w-5 h-5" />
                    </div>
                    {fulfillmentType === "DELIVERY" && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-700" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Diantar ke Rumah
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Kurir toko mengantar pesanan langsung ke depan rumah Anda.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-1 text-xs">
                  <span className="text-stone-500 text-[11px]">Griya Cileungsi 5:</span>
                  <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10.5px]">
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
                    ? "border-[#4A0E4E] bg-purple-50/60 ring-2 ring-[#4A0E4E]/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#4A0E4E]">
                      <Store className="w-5 h-5" />
                    </div>
                    {fulfillmentType === "PICKUP" && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#4A0E4E] bg-purple-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-[#4A0E4E]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Ambil Sendiri di Dapur
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Ambil langsung di dapur toko kami saat pesanan sudah siap.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-purple-200/60 flex flex-wrap items-center justify-between gap-1 text-xs">
                  <span className="text-stone-500 text-[11px]">Biaya:</span>
                  <span className="font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[10.5px]">
                    GRATIS (Rp 0)
                  </span>
                </div>
              </button>
            </div>

            {/* Info Gratis Ongkir Griya Cileungsi 5 */}
            <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center gap-2 text-sm text-emerald-900">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Ketentuan Pengantaran &amp; Gratis Ongkir:</span>
              </div>
              <p className="leading-relaxed text-emerald-900 font-semibold text-xs">
                🎉 <strong>Gratis Ongkos Kirim (Free Ongkir)</strong> khusus seluruh pengantaran di area <strong>Perumahan Griya Cileungsi 5</strong>.
              </p>
              <p className="leading-relaxed text-stone-600 text-[11.5px]">
                Untuk pengantaran ke <strong>luar area Griya Cileungsi 5</strong>, kurir ojek online akan dikoordinasikan via WhatsApp dengan tarif hemat.
              </p>
            </div>

            {/* Input Alamat jika diantar */}
            {fulfillmentType === "DELIVERY" && (
              <div className="pt-1 animate-fadeIn space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Alamat Lengkap Pengantaran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Tuliskan: Blok Rumah, Nomor Rumah, RT/RW, dan patokan (misal: Griya Cileungsi 5 Blok C2 No. 15, dekat Masjid Al-Ikhlas)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs leading-relaxed bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Pembayaran & Catatan Tambahan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#4A0E4E] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                3
              </span>
              <span>Pilihan Pembayaran &amp; Catatan Khusus</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* COD */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    Bayar Tunai saat Diterima (COD)
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    Bayar langsung saat kue tiba di rumah Anda.
                  </p>
                </div>
              </label>

              {/* Transfer / QRIS */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "TRANSFER_BANK"
                    ? "border-[#4A0E4E] bg-purple-50/60 ring-2 ring-[#4A0E4E]/20 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TRANSFER_BANK"
                  checked={paymentMethod === "TRANSFER_BANK"}
                  onChange={() => setPaymentMethod("TRANSFER_BANK")}
                  className="mt-1 h-4 w-4 text-[#4A0E4E] focus:ring-[#4A0E4E] cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#4A0E4E]" />
                    Transfer Bank / QRIS
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    BCA, Mandiri, BRI, atau QRIS All Payment.
                  </p>
                </div>
              </label>
            </div>

            {/* Kotak Info Rekening jika memilih Transfer Bank */}
            {paymentMethod === "TRANSFER_BANK" && (
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#4A0E4E] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#4A0E4E]" />
                    Rincian Rekening Resmi Toko
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Tersedia QRIS
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
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
                    className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-xs font-bold text-[#4A0E4E] hover:bg-purple-100 transition flex items-center gap-1.5 cursor-pointer"
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
                <p className="text-[11px] text-stone-500 leading-tight">
                  💡 Bukti transfer dan konfirmasi dapat Anda kirimkan langsung saat chat WhatsApp toko terbuka.
                </p>
              </div>
            )}

            {/* Jadwal Pengantaran & Catatan */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tanggal Diinginkan (Opsional)</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Jam Pengantaran (Opsional)</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 bg-white"
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
                placeholder="Misal: Tolong kirim hangat sebelum jam 10 pagi, sambal cabai rawit ekstra, dll."
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 bg-white"
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: RINGKASAN PESANAN DENGAN GAMBAR PRODUK JELAS (5 COLS) */}
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
                          // Hide broken image link and display fallback icon
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

              <div className="flex justify-between items-center">
                <span className="text-stone-600">Ongkos Kirim</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {fulfillmentType === "DELIVERY"
                    ? "Free Ongkir (Griya Cileungsi 5)"
                    : "Gratis Rp 0 (Ambil Sendiri)"}
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
                Rincian pesanan dan alamat pengantaran Anda langsung tersusun rapi di WhatsApp toko kami untuk verifikasi instan.
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

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
  Wallet,
  Award,
  Plus,
  Minus,
  Trash2,
  User,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  buildWhatsAppApiUrl,
  getWhatsAppDisplayNumber,
  getWhatsAppNumber,
} from "@/lib/whatsapp";

// ==========================================
// 1. ZOD VALIDATION SCHEMA UNTUK CHECKOUT
// ==========================================
export const checkoutOrderSchema = z
  .object({
    customer_name: z.string().trim().optional(),
    customer_phone: z.string().trim().optional(),
    fulfillment_type: z.enum(["PICKUP", "DELIVERY"]).default("PICKUP"),
    delivery_address: z.string().trim().optional(),
    pickup_time: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    items: z
      .array(z.any())
      .min(1, "Keranjang belanja tidak boleh kosong"),
    total_price: z
      .number()
      .positive("Total harga harus angka positif lebih dari 0"),
  })
  .refine(
    (data) => {
      if (data.fulfillment_type === "DELIVERY") {
        return (data.customer_name || "").trim().length >= 2;
      }
      return true;
    },
    {
      message: "Nama pemesan minimal 2 karakter, wajib diisi untuk opsi Diantar ke Rumah",
      path: ["customer_name"],
    }
  )
  .refine(
    (data) => {
      if (data.fulfillment_type === "DELIVERY") {
        const clean = (data.customer_phone || "").replace(/[^0-9]/g, "");
        const normalized = clean.startsWith("8") ? "0" + clean : clean;
        return (
          normalized.length >= 10 &&
          (normalized.startsWith("08") || normalized.startsWith("628"))
        );
      }
      return true;
    },
    {
      message:
        "Nomor WhatsApp aktif wajib diisi (minimal 10 digit, contoh: 081234567890)",
      path: ["customer_phone"],
    }
  )
  .refine(
    (data) => {
      if (data.fulfillment_type === "DELIVERY") {
        return (data.delivery_address || "").trim().length >= 3;
      }
      return true;
    },
    {
      message:
        "Alamat / blok rumah wajib diisi jika memilih Diantar ke Rumah (contoh: Blok A8 No. 12)",
      path: ["delivery_address"],
    }
  );

const DEFAULT_GOPAY_NUMBER = getWhatsAppDisplayNumber();

interface CompletedOrderInfo {
  orderCode: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  customerName: string;
  customerPhone: string;
  fulfillmentType: "DELIVERY" | "PICKUP";
  deliveryAddress: string;
  pickupTime?: string;
  paymentMethod: "COD" | "QRIS" | "GOPAY";
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
  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "PICKUP">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "QRIS" | "GOPAY">("COD");
  const [notes, setNotes] = useState("");

  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);
  const [isCopiedGopay, setIsCopiedGopay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Completed order data for rendering official receipt (hanya untuk sesi transaksi saat ini)
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  // Bersihkan cache pesanan lama saat halaman dimuat agar setiap order baru selalu bersih
  React.useEffect(() => {
    try {
      localStorage.removeItem("dr_last_completed_order");
    } catch (e) {}
  }, []);

  const handleResetOrder = () => {
    try {
      localStorage.removeItem("dr_last_completed_order");
      localStorage.removeItem("dr_cart_items_v1");
      localStorage.setItem("dr_cart_items_v1", "[]");
      window.history.replaceState(null, "", window.location.pathname);
    } catch (e) {}
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setPickupTime("");
    setNotes("");
    setFieldErrors({});
    setCompletedOrder(null);
  };

  const brandName = settings?.brandName || "Dapur Rasa";
  const brandTagline = settings?.tagline || "Kue Rumahan Kualitas Premium Fresh";

  const rawWa = settings?.whatsappNumber || DEFAULT_GOPAY_NUMBER;
  const GOPAY_NUMBER = rawWa.startsWith("62") ? "0" + rawWa.slice(2) : rawWa;
  const GOPAY_DISPLAY = GOPAY_NUMBER.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  const GOPAY_NAME = `Mama Fatan / ${settings?.brandName || "Dapur Rasa"}`;

  const shippingFee = 0;
  const totalAmount = subtotal + shippingFee;

  const handleCopyGopay = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(GOPAY_NUMBER);
        setIsCopiedGopay(true);
        setTimeout(() => setIsCopiedGopay(false), 2500);
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
${
  completedOrder.fulfillmentType === "DELIVERY"
    ? `Nama Pemesan  : ${completedOrder.customerName}\nNo. WhatsApp  : ${completedOrder.customerPhone}`
    : `Pengambilan   : Ambil di Dapur Toko${completedOrder.customerName && completedOrder.customerName !== "Pembeli (Ambil di Dapur)" ? ` (${completedOrder.customerName})` : ""}`
}

PENGANTARAN / PENGAMBILAN:
${
  completedOrder.fulfillmentType === "DELIVERY"
    ? `• Status       : DIANTAR KE RUMAH\n• Alamat Rumah : ${completedOrder.deliveryAddress}`
    : `• Status       : DIAMBIL SENDIRI DI DAPUR (Griya Cileungsi 5 Blok A8 No. 01)${completedOrder.pickupTime ? `\n• Perkiraan Jam : ${completedOrder.pickupTime}` : ""}`
}

PEMBAYARAN:
• Metode Bayar : ${completedOrder.paymentMethodLabel}
${completedOrder.notes ? `• Catatan      : ${completedOrder.notes}\n` : ""}
RINCIAN PESANAN:
${itemsList}

Subtotal      : ${formatPrice(completedOrder.subtotal)}
Ongkos Kirim  : GRATIS (Free Ongkir)
TOTAL TAGIHAN : ${formatPrice(completedOrder.totalAmount)}
====================================
Terima kasih banyak telah memesan di ${brandName}!
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
    if (isSubmitting) return;
    setErrorMessage(null);
    setFieldErrors({});

    // Tentukan data kontak & alamat berdasarkan fulfillmentType
    const finalCustomerName =
      fulfillmentType === "PICKUP"
        ? (customerName.trim() || "Pembeli (Ambil di Dapur)")
        : customerName.trim();

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    const finalPhone = fulfillmentType === "PICKUP" ? (cleanPhone || "-") : cleanPhone;

    const finalAddress =
      fulfillmentType === "DELIVERY"
        ? deliveryAddress.trim()
        : "Ambil Sendiri di Dapur (Blok A8 No. 01)";

    const rawFormData = {
      customer_name: finalCustomerName,
      customer_phone: finalPhone,
      fulfillment_type: fulfillmentType,
      delivery_address: finalAddress,
      pickup_time: pickupTime.trim(),
      notes: notes.trim(),
      items: items,
      total_price: totalAmount,
    };

    // 1. Validasi Input Pesanan (Zod)
    const validation = checkoutOrderSchema.safeParse(rawFormData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      let firstErrorField = "";
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = issue.message;
        if (!firstErrorField) firstErrorField = field;
      });
      setFieldErrors(errors);
      setErrorMessage(errors[firstErrorField] || "Silakan lengkapi formulir pesanan yang ditandai merah.");

      // Otomatis scroll mulus ke kolom yang belum lengkap agar tidak membingungkan pengguna
      setTimeout(() => {
        const el = document.getElementById(`field-${firstErrorField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).focus?.();
        }
      }, 50);
      return;
    }

    const validData = validation.data;

    // 2. Tampilkan state loading ("Memproses pesanan...")
    setIsSubmitting(true);

    const orderItemsSnapshot = items.map((it) => ({
      name: it.name,
      variantName: it.variantName || null,
      quantity: it.quantity,
      price: it.price,
      subtotal: it.price * it.quantity,
      imageUrl: it.imageUrl || null,
    }));

    const nowFormatted = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const paymentLabel =
      paymentMethod === "COD"
        ? "COD (Bayar Tunai saat Diterima)"
        : paymentMethod === "QRIS"
        ? "QRIS All Payment"
        : "No. Rek (Khusus GoPay)";

    let generatedOrderCode = `DR-${Date.now().toString().slice(-6)}`;

    try {
      // 3. Simpan order ke tabel Supabase public.orders dengan payload lengkap
      const orderPayload = {
        customer_name: finalCustomerName,
        customer_phone: finalPhone,
        delivery_address:
          fulfillmentType === "DELIVERY"
            ? `[Diantar ke Rumah]: ${validData.delivery_address}`
            : `[Ambil Sendiri di Dapur (Blok A8 No. 01)]`,
        notes:
          fulfillmentType === "DELIVERY"
            ? `[Diantar ke Rumah] ${validData.notes || ""}`.trim()
            : `[Ambil di Dapur${pickupTime.trim() ? ` - Jam: ${pickupTime.trim()}` : ""}] ${validData.notes || ""}`.trim(),
        items: orderItemsSnapshot,
        total_price: totalAmount,
        status: "pending",
      };

      const { data: savedOrder, error: supabaseError } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select();

      if (supabaseError) {
        console.warn("Gagal simpan ke Supabase orders:", supabaseError);
      } else if (savedOrder && savedOrder[0]?.id) {
        generatedOrderCode = `DR-${savedOrder[0].id.slice(0, 6).toUpperCase()}`;
      }

      // 4. Susun Pesan WhatsApp Rapi & Bersih (Tanpa no pesanan sesuai instruksi)
      const itemsSummary = items
        .map(
          (it) =>
            `• ${it.name}${it.variantName ? ` (${it.variantName})` : ""} (${it.quantity}x) - ${formatPrice(
              it.price * it.quantity
            )}`
        )
        .join("\n");

      const pickupTimeLine = pickupTime.trim() ? `*Rencana Jam Ambil:* ${pickupTime.trim()}\n` : "";
      const notesLine = validData.notes?.trim() ? `*Catatan:* ${validData.notes.trim()}\n` : "";

      const waText =
        fulfillmentType === "PICKUP"
          ? `Halo ${brandName}, saya mau pesan:

${itemsSummary}

*Total:* ${formatPrice(totalAmount)}
*Metode:* Ambil Sendiri di Dapur (Griya Cileungsi 5 Blok A8 No. 01)
${pickupTimeLine}${notesLine}
Mohon disiapkan ya, terima kasih!`
          : `Halo ${brandName}, saya mau pesan:

${itemsSummary}

*Total:* ${formatPrice(totalAmount)}
*Pemesan:* ${validData.customer_name} (${cleanPhone})
*Opsi Pengiriman:* Diantar ke Rumah (Khusus Area Griya Cileungsi 5)
*Alamat Rumah:* ${validData.delivery_address}
${validData.notes?.trim() ? `*Catatan:* ${validData.notes.trim()}\n` : ""}
Mohon segera diproses ya, terima kasih!`;

      const whatsappUrl = buildWhatsAppApiUrl(waText, settings?.whatsappNumber);

      // 5. Bersihkan isi keranjang belanjaan dan form data secara menyeluruh setelah order berhasil
      clearCart();
      try {
        localStorage.removeItem("dr_cart_items_v1");
        localStorage.setItem("dr_cart_items_v1", "[]");
        localStorage.removeItem("dr_last_completed_order");
      } catch {}

      // Reset seluruh field data pemesan agar transaksi berikutnya wajib mengisi data baru
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setPickupTime("");
      setNotes("");
      setFieldErrors({});

      const completedData: CompletedOrderInfo = {
        orderCode: generatedOrderCode,
        totalAmount,
        subtotal,
        shippingFee: 0,
        customerName: finalCustomerName,
        customerPhone: finalPhone,
        fulfillmentType,
        deliveryAddress: validData.delivery_address || finalAddress,
        pickupTime: pickupTime.trim(),
        paymentMethod,
        paymentMethodLabel: paymentLabel,
        notes: validData.notes || "",
        createdAtFormatted: nowFormatted,
        items: orderItemsSnapshot,
        whatsappUrl,
      };

      try {
        window.history.replaceState(null, "", "?order=" + generatedOrderCode);
      } catch {}

      setCompletedOrder(completedData);

      // 6. Arahkan ke WhatsApp (dilengkapi fallback anti-blokir popup di mobile browser)
      if (whatsappUrl) {
        try {
          const opened = window.open(whatsappUrl, "_blank");
          if (!opened || opened.closed || typeof opened.closed === "undefined") {
            window.location.href = whatsappUrl;
          }
        } catch {
          window.location.href = whatsappUrl;
        }
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================================================
  // VIEW: HASIL BUKTI TRANSAKSI & STRUK RESMI SETELAH CHECKOUT
  // ==============================================================
  if (completedOrder) {
    const isDelivery = completedOrder.fulfillmentType === "DELIVERY";

    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Banner Sukses Atas */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase inline-flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Pesanan Berhasil Tercatat
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Terima Kasih{completedOrder.customerName && completedOrder.customerName !== "Pembeli (Ambil di Dapur)" ? `, ${completedOrder.customerName}` : ""}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Pesanan Anda telah kami catat dalam antrean dapur. Jika aplikasi WhatsApp belum otomatis terbuka di perangkat Anda, silakan tekan tombol hijau di bawah:
          </p>

          {/* Quick WhatsApp Action Launch Button */}
          {completedOrder.whatsappUrl && (
            <div className="pt-1">
              <a
                href={completedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                <span>Buka WhatsApp &amp; Kirim Pesanan Sekarang</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>
            </div>
          )}
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
                <div className="w-11 h-11 rounded-xl bg-[#123829] text-white flex items-center justify-center font-bold text-sm shadow-xs">
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
              <span className="font-mono text-sm sm:text-base font-black text-[#123829]">
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
                {isDelivery ? "Data Pemesan:" : "Penerima Pesanan:"}
              </span>
              <p className="font-bold text-stone-900 text-sm">
                {isDelivery
                  ? completedOrder.customerName
                  : completedOrder.customerName !== "Pembeli (Ambil di Dapur)"
                  ? completedOrder.customerName
                  : "Pembeli Langsung (Ambil di Dapur)"}
              </p>
              {isDelivery && completedOrder.customerPhone && completedOrder.customerPhone !== "-" && (
                <p className="text-stone-600 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{completedOrder.customerPhone}</span>
                </p>
              )}
              {completedOrder.notes && (
                <p className="text-stone-500 text-[11px] mt-1.5 italic">
                  Catatan: {completedOrder.notes}
                </p>
              )}
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                {isDelivery ? "Pengiriman & Pembayaran:" : "Pengambilan & Pembayaran:"}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#123829]">
                {isDelivery ? <Truck className="w-4 h-4 text-[#2E9E6B]" /> : <Store className="w-4 h-4 text-[#123829]" />}
                <span>
                  {isDelivery
                    ? `Diantar ke: ${completedOrder.deliveryAddress}`
                    : "Ambil di Dapur: Griya Cileungsi 5 Blok A8 No. 01"}
                </span>
              </div>
              {completedOrder.pickupTime && (
                <p className="text-[11px] text-[#123829] font-medium mt-1 flex items-center gap-1.5 bg-[#E8F5EE] px-2 py-0.5 rounded-md inline-flex">
                  <Clock className="w-3.5 h-3.5 text-[#2E9E6B]" />
                  <span>Rencana Jam Ambil: <strong>{completedOrder.pickupTime}</strong></span>
                </p>
              )}
              <p className="text-[11px] text-emerald-800 font-semibold mt-1 bg-emerald-50 px-2 py-0.5 rounded block">
                Pembayaran: {completedOrder.paymentMethodLabel}
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
                      <span className="inline-block text-[10px] font-semibold text-[#123829] bg-[#E8F5EE] border border-[#D5EADF] px-1.5 py-0.5 rounded mt-0.5">
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
              <span className="text-[#123829] font-heading font-black text-lg sm:text-xl">
                {formatPrice(completedOrder.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">

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
              className="py-3 px-4 rounded-xl border-2 border-[#123829] bg-[#E8F5EE] hover:bg-[#DCEEE5] text-[#123829] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 text-[#123829]" />
              <span>Cetak / Simpan PDF Struk</span>
            </button>
          </div>

          <div className="text-center pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/produk"
              onClick={handleResetOrder}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesan Kue Lainnya (Keranjang Baru)</span>
            </Link>

            <Link
              href="/"
              onClick={handleResetOrder}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama</span>
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
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#E8F5EE] text-[#123829] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#D5EADF]">
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
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#123829] hover:bg-[#1A4D39] text-white font-extrabold rounded-2xl text-sm shadow-md transition-all cursor-pointer hover:shadow-lg"
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
  // VIEW: FORMULIR CHECKOUT RAPI & LENGKAP
  // ==============================================================
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-40 lg:pb-20 animate-fadeIn">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123829] hover:underline bg-[#E8F5EE] px-3 py-1.5 rounded-full border border-[#D5EADF] transition"
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
          Lengkapi data pemesanan di bawah ini. Pesanan Anda akan otomatis terhubung ke WhatsApp dapur toko kami.
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

      <form id="checkout-form" noValidate onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ============================================================== */}
        {/* LEFT COLUMN: FORM DETAILS LENGKAP & RAPI (7 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* ============================================================== */}
          {/* SECTION 1: PILIHAN PENGANTARAN / PENGAMBILAN PESANAN           */}
          {/* ============================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#123829] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                1
              </span>
              <span>Pilihan Pengantaran / Pengambilan Pesanan</span>
            </h2>

            {/* 2 Opsi Radio: Ambil Sendiri vs Diantar (Liquid Glass Pilihan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Opsi 1: Ambil Sendiri di Dapur */}
              <label
                onClick={() => setFulfillmentType("PICKUP")}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer liquid-glass-shine active:scale-98 ${
                  fulfillmentType === "PICKUP"
                    ? "liquid-glass-mint border-[#2E9E6B] ring-2 ring-[#2E9E6B]/25 shadow-md"
                    : "liquid-glass border-stone-200/80 hover:border-[#2E9E6B]/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="fulfillmentType"
                        value="PICKUP"
                        checked={fulfillmentType === "PICKUP"}
                        onChange={() => setFulfillmentType("PICKUP")}
                        className="w-4 h-4 text-[#123829] focus:ring-[#2E9E6B]"
                      />
                      <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#123829]">
                        <Store className="w-4 h-4" />
                      </div>
                    </div>
                    {fulfillmentType === "PICKUP" && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#123829] bg-[#DCEEE5] px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-[#2E9E6B]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Ambil Sendiri di Dapur (Blok A8 No. 01)
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Ambil pesanan langsung di dapur toko tanpa perlu isi data kontak.
                  </p>
                </div>
              </label>

              {/* Opsi 2: Diantar ke Rumah */}
              <label
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer liquid-glass-shine active:scale-98 ${
                  fulfillmentType === "DELIVERY"
                    ? "liquid-glass-mint border-[#2E9E6B] ring-2 ring-[#2E9E6B]/25 shadow-md"
                    : "liquid-glass border-stone-200/80 hover:border-[#2E9E6B]/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="fulfillmentType"
                        value="DELIVERY"
                        checked={fulfillmentType === "DELIVERY"}
                        onChange={() => setFulfillmentType("DELIVERY")}
                        className="w-4 h-4 text-[#123829] focus:ring-[#2E9E6B]"
                      />
                      <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#123829]">
                        <Truck className="w-4 h-4" />
                      </div>
                    </div>
                    {fulfillmentType === "DELIVERY" && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#123829] bg-[#DCEEE5] px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-[#2E9E6B]" />
                        Dipilih
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Diantar ke Rumah (Khusus Area Griya Cileungsi 5)
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Kurir toko mengantar pesanan langsung ke depan pintu rumah Anda.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: DETAIL DATA (KONDISIONAL PICKUP VS DELIVERY)         */}
          {/* ============================================================== */}
          {fulfillmentType === "PICKUP" ? (
            /* --- KONDISI A: AMBIL SENDIRI DI DAPUR (TANPA DATA KONTAK WAJIB) --- */
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 animate-fadeIn">
              <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#123829] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                  2
                </span>
                <span>Detail Pengambilan di Dapur</span>
              </h2>

              {/* Info Lokasi Dapur */}
              <div className="p-4 bg-[#E8F5EE] rounded-2xl border border-[#D5EADF] text-xs text-stone-700 flex items-start gap-3">
                <Store className="w-5 h-5 text-[#123829] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-[#123829] text-sm">
                    Lokasi Dapur: Perumahan Griya Cileungsi 5 Blok A8 No. 01
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Pesanan Anda akan disiapkan fresh di dapur toko kami. Anda bisa langsung datang dan mengambil pesanan sesuai perkiraan jam yang Anda tentukan di bawah.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#2E9E6B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tanpa antre, tanpa biaya ongkir, langsung disiapkan saat Anda datang!</span>
                  </div>
                </div>
              </div>

              {/* Rencana Jam Pengambilan (Opsional) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-stone-800">
                  Mau Diambil Jam Berapa? (Pilihan Opsional)
                </label>
                <p className="text-[11px] text-stone-500">
                  Pilih waktu cepat atau ketik jam pengambilan yang Anda inginkan:
                </p>

                {/* Quick time selection pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Pagi (08:00 - 10:00)",
                    "Siang (11:00 - 14:00)",
                    "Sore (15:00 - 18:00)",
                    "Malam (18:30 - 21:00)",
                  ].map((timeOption) => {
                    const isSelected = pickupTime === timeOption;
                    return (
                      <button
                        key={timeOption}
                        type="button"
                        onClick={() => setPickupTime(isSelected ? "" : timeOption)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#123829] text-white shadow-xs"
                            : "bg-[#F4F7F5] text-stone-700 hover:bg-[#E8F5EE] hover:text-[#123829] border border-stone-200"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{timeOption}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Input */}
                <div className="relative pt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3.5 pt-1.5 flex items-center pointer-events-none text-stone-400">
                    <Clock className="w-4 h-4 text-[#2E9E6B]" />
                  </div>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="Atau ketik jam sendiri (contoh: Jam 10.30 pagi / Jam 4 sore)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B] bg-white transition"
                  />
                </div>
              </div>

              {/* Catatan Tambahan (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Tambahan untuk Dapur (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong digoreng agak garing saat saya sampai, minta rawit dipisah, dll."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B] bg-white"
                />
              </div>

              {/* Pemberitahuan ramah: tidak butuh data kontak */}
              <div className="p-3 bg-[#E8F5EE] rounded-xl border border-[#D5EADF] text-[11.5px] text-[#123829] flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#2E9E6B] shrink-0 mt-0.5" />
                <span>
                  <strong>Praktis &amp; Cepat:</strong> Khusus opsi ambil di dapur, data kontak dan alamat tidak wajib diisi. Pesanan Anda akan langsung kami proses saat terhubung ke WhatsApp dapur!
                </span>
              </div>
            </div>
          ) : (
            /* --- KONDISI B: DIANTAR KE RUMAH (WAJIB NAMA, TELEPON & ALAMAT) --- */
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 animate-fadeIn">
              <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#123829] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                  2
                </span>
                <span>Data Kontak &amp; Alamat Pengantaran</span>
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
                      id="field-customer_name"
                      name="customer_name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.customer_name) {
                          setFieldErrors((prev) => ({ ...prev, customer_name: "" }));
                        }
                      }}
                      placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition bg-white ${
                        fieldErrors.customer_name
                          ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200"
                          : "border-stone-300 focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B]"
                      }`}
                    />
                  </div>
                  {fieldErrors.customer_name && (
                    <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.customer_name}</span>
                    </p>
                  )}
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
                      id="field-customer_phone"
                      name="customer_phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.customer_phone) {
                          setFieldErrors((prev) => ({ ...prev, customer_phone: "" }));
                        }
                      }}
                      placeholder="Contoh: 081234567890"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition bg-white ${
                        fieldErrors.customer_phone
                          ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200"
                          : "border-stone-300 focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B]"
                      }`}
                    />
                  </div>
                  {fieldErrors.customer_phone ? (
                    <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.customer_phone}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-500 mt-1">
                      Nomor aktif untuk konfirmasi pengantaran via WhatsApp.
                    </p>
                  )}
                </div>
              </div>

              {/* Alamat Pengantaran */}
              <div className="p-4 bg-[#E8F5EE]/60 rounded-2xl border-2 border-[#D5EADF] space-y-2">
                <label className="block text-xs font-bold text-[#123829]">
                  Alamat / Blok Rumah Anda (Khusus Area Griya Cileungsi 5) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-[#2E9E6B]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    id="field-delivery_address"
                    name="delivery_address"
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (fieldErrors.delivery_address) {
                        setFieldErrors((prev) => ({ ...prev, delivery_address: "" }));
                      }
                    }}
                    placeholder="Contoh: Blok A8 No. 12, Blok C2 No. 05, RT/RW, dekat pos satpam..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none transition shadow-2xs leading-relaxed placeholder:text-stone-400 ${
                      fieldErrors.delivery_address
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200"
                        : "border-[#D5EADF] focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B]"
                    }`}
                  />
                </div>
                {fieldErrors.delivery_address && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.delivery_address}</span>
                  </p>
                )}
                <p className="text-[11px] text-[#123829] font-medium">
                  ⚠️ <strong>Wajib diisi:</strong> Sebutkan alamat rumah Anda berada di <strong>Blok berapa dan Nomor berapa</strong> agar kurir dapat mengantar tepat waktu ke depan pintu rumah Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Tambahan Pesanan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Tolong kirim hangat sebelum jam 10 pagi, titip di pos satpam bila rumah kosong, dll."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E9E6B]/20 focus:border-[#2E9E6B] bg-white"
                />
              </div>
            </div>
          )}

          {/* Section 3: Pilihan Pembayaran (COD / QRIS / No Rek Gopay) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#123829] text-white text-xs flex items-center justify-center font-bold shadow-2xs">
                3
              </span>
              <span>Pilihan Pembayaran: Mau COD, QRIS, atau No Rek (GoPay)?</span>
            </h2>

            {/* 3 Opsi Pembayaran */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opsi 1: COD */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all liquid-glass-shine active:scale-98 ${
                  paymentMethod === "COD"
                    ? "liquid-glass-mint border-[#2E9E6B] ring-2 ring-[#2E9E6B]/25 shadow-md"
                    : "liquid-glass border-stone-200/80 hover:border-[#2E9E6B]/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="h-4 w-4 text-[#123829] focus:ring-[#2E9E6B] cursor-pointer"
                    />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                    COD (Bayar Tunai)
                  </h4>
                  <p className="text-[10.5px] text-stone-500 mt-0.5 leading-relaxed">
                    Bayar langsung tunai saat pesanan diterima/diambil.
                  </p>
                </div>
              </label>

              {/* Opsi 2: QRIS */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all liquid-glass-shine active:scale-98 ${
                  paymentMethod === "QRIS"
                    ? "liquid-glass-mint border-[#2E9E6B] ring-2 ring-[#2E9E6B]/25 shadow-md"
                    : "liquid-glass border-stone-200/80 hover:border-[#2E9E6B]/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#123829]">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QRIS"
                      checked={paymentMethod === "QRIS"}
                      onChange={() => setPaymentMethod("QRIS")}
                      className="h-4 w-4 text-[#123829] focus:ring-[#2E9E6B] cursor-pointer"
                    />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                    QRIS All Payment
                  </h4>
                  <p className="text-[10.5px] text-stone-500 mt-0.5 leading-relaxed">
                    Scan barcode QRIS via BCA, Mandiri, BRI, OVO, Dana, dll.
                  </p>
                </div>
              </label>

              {/* Opsi 3: No Rek (Khusus GoPay) */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all liquid-glass-shine active:scale-98 ${
                  paymentMethod === "GOPAY"
                    ? "liquid-glass-mint border-sky-500 ring-2 ring-sky-500/25 shadow-md"
                    : "liquid-glass border-stone-200/80 hover:border-sky-400/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GOPAY"
                      checked={paymentMethod === "GOPAY"}
                      onChange={() => setPaymentMethod("GOPAY")}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                    No Rek (Khusus GoPay)
                  </h4>
                  <p className="text-[10.5px] text-stone-500 mt-0.5 leading-relaxed">
                    Transfer saldo langsung ke nomor GoPay toko.
                  </p>
                </div>
              </label>
            </div>

            {/* DETAIL KOTAK PEMBAYARAN KONDISIONAL */}
            {paymentMethod === "QRIS" && (
              <div className="p-4 bg-[#E8F5EE] rounded-2xl border border-[#D5EADF] text-xs text-[#111915] space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-sm text-[#123829]">
                  <QrCode className="w-4 h-4" />
                  <span>Petunjuk Pembayaran QRIS:</span>
                </div>
                <p className="leading-relaxed text-[11.5px] text-stone-700">
                  Barcode QRIS All Payment akan otomatis dikirimkan via chat WhatsApp toko saat pesanan Anda dibuat. Anda dapat langsung scan dari aplikasi BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, atau DANA.
                </p>
              </div>
            )}

            {paymentMethod === "GOPAY" && (
              <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 text-xs text-sky-950 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
                    <Smartphone className="w-4 h-4 text-sky-700" />
                    <span>Nomor Resmi GoPay Toko:</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    Khusus GoPay
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 block uppercase">Akun GoPay Toko</span>
                    <span className="font-mono font-black text-sky-900 text-base sm:text-lg tracking-wider">
                      {GOPAY_DISPLAY}
                    </span>
                    <span className="text-[10.5px] text-stone-500 block">
                      a.n. {GOPAY_NAME}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGopay}
                    className="px-3.5 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-xs font-bold text-sky-800 hover:bg-sky-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isCopiedGopay ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. GoPay</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-sky-900 italic">
                  💡 Silakan transfer saldo GoPay ke nomor di atas, dan kirimkan bukti transfer via chat WhatsApp toko.
                </p>
              </div>
            )}
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
              <span className="text-xs font-bold text-[#123829] bg-[#E8F5EE] border border-[#D5EADF] px-3 py-1 rounded-full">
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
                      <span className="inline-block text-[10.5px] font-semibold text-[#123829] bg-[#E8F5EE] border border-[#D5EADF] px-2 py-0.5 rounded-md">
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
                <span>Pengiriman</span>
                <span className="font-bold text-stone-900">
                  {fulfillmentType === "DELIVERY" ? "Diantar ke Rumah" : "Diambil Sendiri"}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-600">
                <span>Pembayaran</span>
                <span className="font-bold text-[#123829] bg-[#E8F5EE] px-2 py-0.5 rounded text-[11px]">
                  {paymentMethod === "COD"
                    ? "COD (Tunai)"
                    : paymentMethod === "QRIS"
                    ? "QRIS All Payment"
                    : "No. Rek (GoPay)"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-900 pt-3 border-t border-stone-100">
                <span>Total Tagihan</span>
                <span className="text-xl sm:text-2xl font-heading font-black text-[#123829]">
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
                Rincian pesanan dan pilihan pengiriman Anda langsung terhubung ke WhatsApp toko untuk konfirmasi cepat.
              </p>
            </div>

            {/* Tombol Utama Kirim Pesanan Desktop */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`hidden lg:flex w-full py-4 px-6 rounded-full font-extrabold text-white items-center justify-between shadow-floating transition-all text-sm sm:text-base cursor-pointer active:scale-[0.99] ${
                isSubmitting
                  ? "bg-stone-400 cursor-not-allowed"
                  : "bg-[#123829] hover:bg-[#1A4D39]"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 w-full">
                  <Loader2 className="w-5 h-5 animate-spin text-[#47C98E]" />
                  <span>Memproses pesanan...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-5 h-5 text-[#47C98E]" />
                    <span>Lanjut Bayar &amp; Pesan via WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{formatPrice(totalAmount)}</span>
                    <ArrowRight className="w-4 h-4 text-[#47C98E]" />
                  </div>
                </>
              )}
            </button>

            {/* Keamanan & Garansi Toko */}
            <div className="pt-1 flex items-center justify-center gap-4 text-[10.5px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Higienis &amp; Fresh
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Rasa Terjamin
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* ============================================================== */}
      {/* MOBILE FLOATING BOTTOM BAR (100% BEBAS DARI HALANGAN & POPUP BLOCK) */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#D5EADF] shadow-[0_-6px_25px_rgba(18,56,41,0.15)] px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom,0.85rem))]">
        {/* Banner peringatan langsung jika ada data yang belum lengkap */}
        {errorMessage && (
          <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn">
            <span className="truncate">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 font-bold text-xs shrink-0 px-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-[#687871] font-bold block uppercase tracking-wider">
              Total ({totalItems} Menu):
            </span>
            <span className="font-extrabold text-base sm:text-lg text-[#123829] font-mono leading-none">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            onClick={(e) => {
              // Fallback jika form attribute tidak di-trigger oleh browser mobile tertentu
              const form = document.getElementById("checkout-form") as HTMLFormElement;
              if (form && typeof form.requestSubmit === "function") {
                form.requestSubmit();
              } else {
                handleSubmit(e);
              }
            }}
            className={`px-5 py-3 rounded-full font-extrabold text-white text-xs sm:text-sm flex items-center gap-2 shadow-floating shrink-0 cursor-pointer transition active:scale-95 ${
              isSubmitting
                ? "bg-stone-400 cursor-not-allowed"
                : "bg-[#123829] hover:bg-[#1A4D39]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#47C98E]" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 text-[#47C98E]" />
                <span>Lanjut Bayar (WA)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

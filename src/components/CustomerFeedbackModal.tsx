"use client";

import React, { useState } from "react";
import {
  X,
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
  Heart,
  ThumbsUp,
  Lightbulb,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTestimonial: any) => void;
}

export default function CustomerFeedbackModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomerFeedbackModalProps) {
  const { settings } = useStore();
  const [feedbackType, setFeedbackType] = useState<"ULASAN" | "SARAN" | "KRITIK">("ULASAN");
  const [customerName, setCustomerName] = useState("");
  const [eventOrProduct, setEventOrProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage("Nama Anda wajib diisi.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Pesan ulasan / saran & kritik wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          eventOrProduct: eventOrProduct.trim() || undefined,
          feedbackType,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim masukan.");

      setIsSuccess(true);
      setSubmittedData(data.testimonial);

      if (onSuccess) {
        onSuccess(data.testimonial);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCustomerName("");
    setEventOrProduct("");
    setComment("");
    setRating(5);
    setErrorMessage(null);
    onClose();
  };

  const storeWa = (settings?.whatsappNumber || "085888159765").replace(/[^0-9]/g, "");
  let formattedWa = storeWa;
  if (formattedWa.startsWith("0")) formattedWa = "62" + formattedWa.slice(1);
  else if (!formattedWa.startsWith("62")) formattedWa = "62" + formattedWa;

  const waFeedbackMessage = `Halo ${settings?.brandName || "Dapur Rasa"}, saya ingin memberikan ${
    feedbackType === "SARAN" ? "saran" : feedbackType === "KRITIK" ? "kritik & masukan" : "ulasan"
  }:

• Nama: ${customerName.trim()}
• Rating: ${"⭐".repeat(rating)}
${eventOrProduct.trim() ? `• Menu/Acara: ${eventOrProduct.trim()}\n` : ""}• Pesan:
"${comment.trim()}"

Terima kasih banyak!`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?phone=${formattedWa}&text=${encodeURIComponent(
    waFeedbackMessage
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-auto animate-scaleIn max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Terima Kasih Banyak!
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heading">
                Masukan Anda Telah Kami Terima
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Ulasan, saran, dan kritik dari Anda sangat berarti untuk terus meningkatkan kelezatan kue dan pelayanan dapur kami.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs text-stone-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{customerName}</span>
                <span className="text-amber-500 font-bold">{"⭐".repeat(rating)}</span>
              </div>
              <p className="italic text-stone-600">&ldquo;{comment}&rdquo;</p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim juga ke WhatsApp Pemilik Toko</span>
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Selesai &amp; Kembali ke Web
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Form */}
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10.5px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Ruang Saran &amp; Ulasan Pelanggan</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-heading">
                Tulis Ulasan, Saran &amp; Kritik
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ceritakan kepuasan Anda atau berikan masukan agar Dapur Rasa bisa melayani lebih baik lagi.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pilihan Jenis Masukan: 3 Tabs */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">
                Pilih Jenis Masukan:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "ULASAN", label: "Ulasan & Review", icon: ThumbsUp },
                  { id: "SARAN", label: "Saran Menu", icon: Lightbulb },
                  { id: "KRITIK", label: "Kritik", icon: MessageSquare },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = feedbackType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFeedbackType(tab.id as any)}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer text-xs font-bold ${
                        isSelected
                          ? "border-[#4A0E4E] bg-purple-50 text-[#4A0E4E] ring-1 ring-[#4A0E4E]/30"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Stars */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">
                Rating Kepuasan Anda:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-stone-300 hover:scale-125 transition-transform cursor-pointer"
                      title={`${star} Bintang`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating ?? rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  {rating === 5
                    ? "Sangat Puas ⭐⭐⭐⭐⭐"
                    : rating === 4
                    ? "Puas ⭐⭐⭐⭐"
                    : rating === 3
                    ? "Cukup ⭐⭐⭐"
                    : rating === 2
                    ? "Kurang ⭐⭐"
                    : "Perlu Perbaikan ⭐"}
                </span>
              </div>
            </div>

            {/* Nama & Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Anda <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Misal: Ibu Rina / Dimas"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Menu / Acara (Opsional)
                </label>
                <input
                  type="text"
                  value={eventOrProduct}
                  onChange={(e) => setEventOrProduct(e.target.value)}
                  placeholder="Misal: Pastel & Risol Mayo"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
                />
              </div>
            </div>

            {/* Isi Komentar */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pesan Komentar, Saran, atau Kritik <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  feedbackType === "SARAN"
                    ? "Tuliskan saran menu baru atau perbaikan pelayanan yang Anda harapkan..."
                    : feedbackType === "KRITIK"
                    ? "Tuliskan kritik jujur Anda agar kami bisa segera mengevaluasi dapur kami..."
                    : "Ceritakan rasa kue, kerenyahan pastel, dan pengalaman berbelanja Anda..."
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Mengirim..." : "Kirim Masukan"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

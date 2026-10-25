"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquareQuote, ArrowRight, Plus, Sparkles, CheckCircle } from "lucide-react";
import CustomerFeedbackModal from "@/components/CustomerFeedbackModal";

interface TestimonialItem {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  avatarUrl?: string | null;
  eventOrProduct?: string | null;
  isSample: boolean;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/testimonials", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch((e) => console.error("Error loading testimonials:", e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleNewFeedback = (newT: TestimonialItem) => {
    setTestimonials((prev) => [newT, ...prev]);
    setToastMessage("Terima kasih! Ulasan & masukan Anda langsung tampil.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal Komen / Saran & Kritik */}
      <CustomerFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewFeedback}
      />

      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold text-amber-800 tracking-wider uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Kepuasan &amp; Kepercayaan Pelanggan</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
          Ulasan, Kritik &amp; Saran Pelanggan
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Cerita nyata dari pelanggan yang menikmati kue Dapur Rasa. Punya kritik, saran menu, atau ulasan? Kami sangat terbuka untuk mendengar masukan Anda!
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Ulasan, Kritik &amp; Saran Anda</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-stone-200 animate-pulse space-y-4">
              <div className="w-1/3 h-4 bg-stone-200 rounded" />
              <div className="h-16 bg-stone-100 rounded" />
              <div className="w-1/2 h-8 bg-stone-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-stone-200 space-y-3">
          <MessageSquareQuote className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-stone-800 font-bold text-base">Belum ada ulasan saat ini</h3>
          <p className="text-xs text-stone-500">Jadilah pelanggan pertama yang memberikan ulasan atau saran!</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4A0E4E] text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Masukan Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4A0E4E] font-bold flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-purple-200">
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt={t.customerName} className="w-full h-full object-cover" />
                  ) : (
                    t.customerName.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-stone-900 truncate">{t.customerName}</div>
                  {t.eventOrProduct && (
                    <div className="text-[11px] text-stone-500 truncate">{t.eventOrProduct}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="mt-14 text-center bg-amber-50/60 rounded-3xl p-6 sm:p-8 border border-amber-200/60 max-w-2xl mx-auto space-y-3">
        <h3 className="font-heading font-bold text-lg sm:text-xl text-stone-900">
          Ingin Mencicipi Kelezatan Kue Kami?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600">
          Pesan sekarang juga melalui website atau konsultasikan kebutuhan snack box Anda bersama tim kami.
        </p>
        <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A0E4E] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#5C1261] transition"
          >
            <span>Pilih Menu Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition"
          >
            <span>+ Tulis Ulasan / Saran</span>
          </button>
        </div>
      </div>
    </div>
  );
}

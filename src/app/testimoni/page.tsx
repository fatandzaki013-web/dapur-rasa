"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquareQuote, ArrowRight } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/public/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch((e) => console.error("Error loading testimonials:", e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
          Kepuasan & Kepercayaan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading mt-1">
          Ulasan & Testimoni Pelanggan
        </h1>
        <p className="text-stone-600 text-sm mt-2">
          Cerita nyata dari pelanggan kami yang menikmati sajian aneka kue rumahan dan paket snack box untuk berbagai momen istimewa.
        </p>
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
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-stone-200">
          <MessageSquareQuote className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-stone-800 font-semibold mb-1">Belum ada ulasan saat ini</h3>
          <p className="text-xs text-stone-500">Jadilah pelanggan pertama yang memberikan ulasan!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-stone-700 italic leading-relaxed mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt={t.customerName} className="w-full h-full object-cover" />
                  ) : (
                    t.customerName.charAt(0)
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">{t.customerName}</div>
                  {t.eventOrProduct && (
                    <div className="text-[11px] text-stone-500">{t.eventOrProduct}</div>
                  )}
                </div>
                {t.isSample && (
                  <span className="ml-auto text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md">
                    Contoh Demo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="mt-16 text-center bg-amber-50/60 rounded-3xl p-8 border border-amber-200/60 max-w-2xl mx-auto">
        <h3 className="font-heading font-bold text-xl text-stone-900 mb-2">
          Ingin Mencicipi Kelezatan Kue Kami?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mb-5">
          Pesan sekarang juga melalui website atau konsultasikan kebutuhan snack box Anda bersama tim kami.
        </p>
        <Link
          href="/produk"
          className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary text-white font-semibold text-xs rounded-xl shadow-md hover:opacity-90 transition-all"
        >
          <span>Pilih Menu Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

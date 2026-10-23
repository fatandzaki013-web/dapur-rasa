"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Edit3,
  Clock,
  CheckCircle,
  Eye,
  UtensilsCrossed,
} from "lucide-react";

export interface CakeProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  promoPrice?: number | null;
  unit: string;
  stock: number;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category: { name: string; slug: string };
  variants?: Array<{ id: string; name: string; priceAdjustment: number; stock: number }>;
}

interface HeroCakeTitleShowcaseProps {
  products: CakeProduct[];
  customConfig?: string | null;
  formatPrice: (amount: number) => string;
  onQuickAdd: (product: CakeProduct) => void;
  onOpenQuickEditor?: (productId: string) => void;
}

export default function HeroCakeTitleShowcase({
  products,
  customConfig,
  formatPrice,
  onQuickAdd,
  onOpenQuickEditor,
}: HeroCakeTitleShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse customConfig for overrides
  let overrides: Record<string, any> = {};
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      if (parsed.slides) overrides = parsed.slides;
    } catch (e) {
      console.error("Failed to parse hero customConfig:", e);
    }
  }

  // Ensure all products are converted into hero slides
  const slides = products.map((prod, idx) => {
    const override = overrides[prod.id] || {};
    const primaryImg =
      prod.images && prod.images.length > 0
        ? prod.images.find((img) => img.isPrimary)?.url || prod.images[0].url
        : "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=1000&auto=format&fit=crop&q=80";

    return {
      productId: prod.id,
      originalProduct: prod,
      cakeTitle: override.customTitle || prod.name,
      photoUrl: override.customImageUrl || primaryImg,
      badgeText: override.customBadge || (prod.isBestSeller ? "Terlaris (Best Seller)" : prod.isNew ? "Varian Baru" : "Kue Rumahan Autentik"),
      subtitle:
        override.customSubtitle ||
        prod.shortDescription ||
        "Dibuat dengan bahan pilihan bermutu tinggi, resep otentik warisan keluarga.",
      price: prod.price,
      originalPrice: null,
      unit: prod.unit || "pcs",
      slug: prod.slug,
      categoryName: prod.category?.name || "Kue & Camilan",
    };
  });

  const totalSlides = slides.length;

  // Auto-slide loop with progress indicator
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const intervalDuration = 4000; // 4 seconds per slide
    const updateInterval = 50; // update progress bar every 50ms
    const stepIncrement = (updateInterval / intervalDuration) * 100;

    progressTimerRef.current = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((cur) => (cur + 1) % totalSlides);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, updateInterval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [totalSlides, isPaused]);

  // Reset progress when index manually changes
  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    setSlideProgress(0);
  };

  const handleNext = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setSlideProgress(0);
  };

  const handlePrev = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setSlideProgress(0);
  };

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className="relative overflow-hidden bg-stone-900 text-stone-100 pt-6 pb-12 sm:pb-16 transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background photo of current cake with soft blur */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-all duration-1000 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSlide.photoUrl}
          alt={currentSlide.cakeTitle}
          className="w-full h-full object-cover scale-110 filter blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar: Slide counter, timer progress, pause state */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-800/80 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
              {String(currentIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              Koleksi Kue Pembukaan Beranda
            </span>
            {isPaused && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                Auto-Slide Dijeda
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenQuickEditor && (
              <button
                type="button"
                onClick={() => onOpenQuickEditor(currentSlide.productId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all border border-amber-600/30 cursor-pointer"
                title="Ubah Foto & Judul Kue yang Sedang Tampil Ini"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ubah Foto Judul Ini</span>
              </button>
            )}

            {/* Prev / Next Arrows */}
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              aria-label="Kue Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              aria-label="Kue Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar for Auto-Slide */}
        <div className="w-full bg-stone-800 h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${slideProgress}%` }}
          />
        </div>

        {/* MAIN TITLE & PHOTO SHOWCASE STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: Judul Nama Kue dengan Foto Terintegrasi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category & Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {currentSlide.badgeText}
              </span>
              <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-medium">
                {currentSlide.categoryName}
              </span>
            </div>

            {/* NAMA KUE SEBAGAI JUDUL UTAMA BESAR */}
            <div className="space-y-3">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
                {currentSlide.cakeTitle}
              </h1>
              <p className="text-base sm:text-lg text-stone-300 font-sans leading-relaxed max-w-xl">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Price & Packaging Pill */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                {formatPrice(currentSlide.price)}
              </span>
              <span className="text-stone-400 text-sm">/ {currentSlide.unit}</span>
              {currentSlide.originalPrice && (
                <span className="text-stone-500 line-through text-sm font-mono">
                  {formatPrice(currentSlide.originalPrice)}
                </span>
              )}
            </div>

            {/* Action Buttons: Add to Cart & Detail */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
              <button
                type="button"
                onClick={() => onQuickAdd(currentSlide.originalProduct)}
                className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer active:scale-95 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pesan Kue Ini Sekarang</span>
              </button>

              <Link
                href={`/produk/${currentSlide.slug}`}
                prefetch={true}
                className="px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-2xl border border-stone-700 shadow-xs flex items-center gap-2 transition-all hover:scale-102 text-sm"
              >
                <span>Lihat Detail Kue</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* RIGHT: FOTO KUE DI DALAM JUDUL PEMBUKAAN (Large Delicious Photographic Showcase) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/50 group bg-stone-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={currentSlide.photoUrl}
                src={currentSlide.photoUrl}
                alt={currentSlide.cakeTitle}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 animate-fadeIn"
              />

              {/* Gradient Bottom Overlay with Title Inside the Photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-black/20 flex flex-col justify-end p-6">
                <span className="text-xs font-bold text-amber-300 tracking-wider uppercase mb-1">
                  Foto Pembukaan Web
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-heading leading-tight drop-shadow-md">
                  {currentSlide.cakeTitle}
                </span>

                {/* Direct quick action inside the photo frame */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/20">
                  <span className="text-xs font-semibold text-stone-200">
                    Kue Siap Dipesan
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuickAdd(currentSlide.originalProduct)}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition-transform active:scale-90 cursor-pointer shadow-md"
                    title="Tambah Cepat ke Keranjang"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FILMSTRIP TRACK: SEMUA KUE ADA DI SINI */}
        <div className="mt-12 pt-8 border-t border-stone-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Pilih & Geser Judul Semua Kue Toko ({totalSlides} Kue)
            </span>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Klik kue mana pun untuk langsung menampilkan judul & fotonya
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
            {slides.map((s, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={s.productId}
                  type="button"
                  onClick={() => handleSelectSlide(idx)}
                  className={`shrink-0 flex items-center gap-3 p-2 rounded-2xl border transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 scale-102"
                      : "bg-stone-800/60 border-stone-700/60 hover:bg-stone-800 hover:border-stone-600 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.photoUrl}
                    alt={s.cakeTitle}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="pr-2">
                    <span
                      className={`text-xs font-bold block truncate max-w-[140px] font-heading ${
                        isActive ? "text-amber-300" : "text-stone-200"
                      }`}
                    >
                      {s.cakeTitle}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono block">
                      {formatPrice(s.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

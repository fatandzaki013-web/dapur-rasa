"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";

import { DEFAULT_GALLERY_ITEMS, GalleryItem } from "@/lib/constants";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [selectedTag, setSelectedTag] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch gallery items from public API
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/public/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setItems(data.items);
          setFilteredItems(data.items);
        }
      })
      .catch((e) => console.error("Error loading gallery:", e))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter items by category tag
  useEffect(() => {
    if (selectedTag === "Semua") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.categoryTag === selectedTag));
    }
  }, [selectedTag, items]);

  // Extract unique category tags
  const tags = ["Semua", ...Array.from(new Set(items.map((i) => i.categoryTag).filter(Boolean)))];

  // Lightbox keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  };

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 sm:pb-16">
      {/* Header Halaman */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A0E4E]/10 text-[#4A0E4E] text-xs font-bold uppercase tracking-wider">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Koleksi Visual Toko
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Galeri Foto Kue &amp; Camilan
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto">
          Lihat ragam foto kelezatan aneka pastel renyah, risol mayo lumer, bolu lembut, brownies panggang, dan paket snack box berkualitas kami.
        </p>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag as string)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#4A0E4E] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Foto Galeri dengan NAMA KUE JELAS */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-800 font-semibold mb-1">Belum ada foto dalam kategori ini</h3>
          <p className="text-xs text-gray-500">Silakan pilih kategori galeri lainnya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 w-full max-w-full overflow-hidden">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />

                {item.categoryTag && (
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#4A0E4E] shadow-sm">
                    {item.categoryTag}
                  </span>
                )}
              </div>

              {/* NAMA KUE DI BAGIAN BAWAH KARTU (TERLIHAT JELAS) */}
              <div className="p-4 flex flex-col justify-between space-y-1 bg-white">
                <h3 className="font-extrabold text-sm sm:text-[15px] text-gray-900 group-hover:text-[#4A0E4E] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption Card */}
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <div className="relative max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentItem.imageUrl}
                alt={currentItem.altText || currentItem.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>

            {/* Caption bar */}
            <div className="mt-4 text-center text-white space-y-1 max-w-lg">
              {currentItem.categoryTag && (
                <span className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
                  {currentItem.categoryTag}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold font-heading">{currentItem.title}</h2>
              {currentItem.caption && (
                <p className="text-xs text-gray-300">{currentItem.caption}</p>
              )}

              {/* Link to connected product if any */}
              {currentItem.product && (
                <div className="pt-2">
                  <Link
                    href={`/produk/${currentItem.product.slug}`}
                    onClick={() => setLightboxIndex(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A0E4E] hover:bg-[#5C1261] text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Lihat &amp; Pesan Kue Ini ({currentItem.product.name})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

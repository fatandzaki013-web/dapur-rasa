"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Cake,
  ShoppingBag,
  Sparkles,
  Edit3,
  X,
  CheckCircle,
  Save,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  shortDescription?: string;
}

interface FrontpageAdminBarProps {
  products: ProductOption[];
  onConfigUpdated?: () => void;
}

export default function FrontpageAdminBar({ products, onConfigUpdated }: FrontpageAdminBarProps) {
  const { sections, refreshStoreData } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<{ totalProducts: number; totalOrders: number; totalRevenue: number }>({
    totalProducts: 8,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Modal editing state for Opening Title & Photos
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customBadge, setCustomBadge] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ready-to-use appetizing image presets for quick replacement
  const imagePresets = [
    { label: "Pastel Emas Renyah", url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=1000&auto=format&fit=crop&q=80" },
    { label: "Pastel Kulit Berlapis", url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1000&auto=format&fit=crop&q=80" },
    { label: "Risol Mayo Lumer", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=80" },
    { label: "Sosis Solo Gurih", url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1000&auto=format&fit=crop&q=80" },
    { label: "Brownies Fudgy Cokelat", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1000&auto=format&fit=crop&q=80" },
    { label: "Lapis Legit Wisman", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80" },
    { label: "Klepon Tradisional Pandan", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80" },
    { label: "Nastar Keju Wisman", url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1000&auto=format&fit=crop&q=80" },
    { label: "Snack Box Mewah", url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&auto=format&fit=crop&q=80" },
  ];

  // Fetch quick stats
  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.metrics) {
          setStats({
            totalProducts: data.metrics.totalProducts || products.length || 8,
            totalOrders: data.metrics.totalOrders || 0,
            totalRevenue: data.metrics.totalRevenue || 0,
          });
        }
      })
      .catch(() => {
        // Fallback default
        setStats((prev) => ({ ...prev, totalProducts: products.length || 8 }));
      });
  }, [products]);

  // Load selected product info into form
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // Check if customConfig has overrides for this product
    const heroSec = sections.find((s) => s.sectionKey === "hero");
    let overrides: any = {};
    if (heroSec?.customConfig) {
      try {
        const parsed = JSON.parse(heroSec.customConfig);
        overrides = parsed.slides?.[selectedProductId] || {};
      } catch (e) {
        console.error(e);
      }
    }

    setCustomTitle(overrides.customTitle || prod.name);
    setCustomImageUrl(overrides.customImageUrl || prod.imageUrl);
    setCustomBadge(overrides.customBadge || "Fresh Daily");
    setCustomSubtitle(overrides.customSubtitle || prod.shortDescription || "");
  }, [selectedProductId, products, sections]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveHeroSlide = async () => {
    if (!selectedProductId) return;
    setIsSaving(true);

    try {
      const heroSec = sections.find((s) => s.sectionKey === "hero");
      let currentConfig: any = { slides: {} };
      if (heroSec?.customConfig) {
        try {
          currentConfig = JSON.parse(heroSec.customConfig);
          if (!currentConfig.slides) currentConfig.slides = {};
        } catch (e) {}
      }

      currentConfig.slides[selectedProductId] = {
        customTitle: customTitle.trim(),
        customImageUrl: customImageUrl.trim(),
        customBadge: customBadge.trim(),
        customSubtitle: customSubtitle.trim(),
      };

      const updatedSections = sections.map((s) =>
        s.sectionKey === "hero"
          ? {
              ...s,
              customConfig: JSON.stringify(currentConfig),
            }
          : s
      );

      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan ke server. Pastikan Anda sudah login admin.");
      }

      await refreshStoreData();
      if (onConfigUpdated) onConfigUpdated();
      showToast("Foto judul pembukaan web berhasil diperbarui!");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan. Pastikan Anda login di /admin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-500 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Frontpage Bar Component */}
      <aside aria-label="Panel Kendali Pengelola Toko" className="bg-stone-900 text-stone-100 border-b border-amber-600/40 shadow-lg text-xs transition-all">
        {/* Toggle Bar Top Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Panel Pengelola Toko (Dashboard Depan)
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 bg-stone-800 text-stone-400 rounded-md text-[10px]">
              Toko Aktif
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Button to Edit Opening Title Photos */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Foto Judul Pembukaan</span>
            </button>

            {/* Direct Link to Full CMS */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs transition-colors border border-stone-700"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Full Dashboard</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title={isExpanded ? "Sembunyikan Ringkasan" : "Tampilkan Ringkasan"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Overview Metrics & Shortcuts */}
        {isExpanded && (
          <div className="border-t border-stone-800/80 bg-stone-950/70 px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Quick Metrics */}
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-stone-400">Total Kue:</span>
                  <span className="font-bold text-white">{stats.totalProducts} Produk Aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-stone-400">Pesanan Masuk:</span>
                  <span className="font-bold text-white">{stats.totalOrders} Pesanan</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-stone-400">Status Pembukaan:</span>
                  <span className="font-semibold text-emerald-400">Auto-Slide Aktif (Semua Kue)</span>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/admin/products"
                  className="px-2.5 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px]"
                >
                  🍰 Kelola Produk
                </Link>
                <Link
                  href="/admin/orders"
                  className="px-2.5 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px]"
                >
                  📦 Kelola Pesanan
                </Link>
                <Link
                  href="/admin/gallery"
                  className="px-2.5 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px]"
                >
                  📸 Galeri Foto
                </Link>
                <Link
                  href="/admin/homepage"
                  className="px-2.5 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px]"
                >
                  🎨 Tampilan Web
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MODAL: UBAH FOTO & JUDUL PEMBUKAAN WEB */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-stone-900">
                    Ubah Foto & Judul Pembukaan Web
                  </h3>
                  <p className="text-xs text-stone-500">
                    Atur nama kue dan foto yang tampil di judul pembukaan beranda (Hero Slider).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cake Selector */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  1. Pilih Kue yang Ingin Diubah Judul & Fotonya:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ({p.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Badge inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    Judul Teks Pembukaan (Nama Kue)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Misal: Pastel Crispy Spesial Renyah"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Nama ini akan muncul sebagai judul besar utama di slide pembukaan.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    Badge / Label Kecil
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="Misal: Best Seller / Renyah Gurih"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Label kecil di atas judul nama kue.
                  </span>
                </div>
              </div>

              {/* Subtitle / Description input */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  Sub-judul / Deskripsi Singkat Kue
                </label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  placeholder="Deskripsi singkat kelezatan kue ini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Image URL input */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  URL Gambar Foto Kue di Judul Pembukaan (https://...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick Image Preset Picker */}
              <div>
                <label className="block font-bold text-stone-600 mb-1.5">
                  Atau Pilih Cepat dari Galeri Foto Lezat Siap Pakai:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {imagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomImageUrl(preset.url)}
                      className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                        customImageUrl === preset.url
                          ? "border-amber-600 ring-2 ring-amber-500/30 bg-amber-50"
                          : "border-stone-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <span className="block text-[10px] font-medium text-stone-700 mt-1 truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Image Preview */}
              {customImageUrl && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customImageUrl}
                    alt="Pratinjau"
                    className="w-20 h-20 object-cover rounded-xl shadow-xs border border-white"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-stone-900 block font-heading">
                      {customTitle || "Judul Kue"}
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold inline-block px-2 py-0.5 rounded bg-amber-100 mt-0.5">
                      {customBadge || "Fresh Daily"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-1 line-clamp-1">
                      {customSubtitle || "Deskripsi kue"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveHeroSlide}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:bg-stone-400"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan & Terapkan di Beranda"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

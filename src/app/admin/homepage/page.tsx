"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  UtensilsCrossed,
  Sparkles,
  Image as ImageIcon,
  Edit3,
  Upload,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";

interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonLink?: string | null;
  badgeText?: string | null;
  customConfig?: string | null;
  isEnabled: boolean;
  displayOrder: number;
}

interface HeroBannerSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  desktopImg: string;
  mobileImg: string;
}

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>("hero");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5 Hero Slider Banners state
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>([
    {
      id: 1,
      title: "Pastel Crispy & Risol Mayo Lumer",
      subtitle: "Kerenyahan Kulit Berlapis dengan Isian Daging & Keju Melimpah",
      badge: "Kue Terlaris #1",
      buttonText: "Belanja Sekarang",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 2,
      title: "Brownies Panggang Fudgy Cokelat Belgia",
      subtitle: "Tekstur Shiny Crust Lembut & Cokelat Asli yang Meleleh di Lidah",
      badge: "Varian Baru",
      buttonText: "Lihat Produk",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 3,
      title: "Sosis Solo Gurih & Aneka Kue Basah",
      subtitle: "Resep Warisan Nusantara, Dibuat Fresh Setiap Hari",
      badge: "Khas Tradisional",
      buttonText: "Pesan Sekarang",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 4,
      title: "Paket Snack Box Acara & Rapat Kantor",
      subtitle: "Pilihan Kue Lengkap, Kemasan Elegan, Higienis & Tepat Waktu",
      badge: "Paket Spesial",
      buttonText: "Konsultasi Snack Box",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 5,
      title: "Frozen Food Siap Goreng Kapan Saja",
      subtitle: "Pastel & Risol Beku Praktis untuk Stok Camilan Nikmat di Rumah",
      badge: "Frozen Food",
      buttonText: "Lihat Frozen Food",
      buttonLink: "/produk?category=frozen-food",
      desktopImg: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=85",
    },
  ]);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/admin/sections");
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);

        // Check if hero has customConfig with customBanners
        const heroSec = data.sections.find((s: any) => s.sectionKey === "hero");
        if (heroSec?.customConfig) {
          try {
            const parsed = JSON.parse(heroSec.customConfig);
            if (parsed.customBanners && Array.isArray(parsed.customBanners)) {
              setHeroBanners(parsed.customBanners);
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    Promise.all([fetchSections(), fetchProducts()]).finally(() => {
      clearTimeout(timer);
      setIsLoading(false);
    });
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload file handler
  const handleFileUpload = async (file: File, onDone: (url: string) => void, targetId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadingTarget(targetId);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah foto.");
      }
      onDone(data.url);
      showToast("Foto berhasil diunggah dari komputer Anda!");
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto.");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleUpdateSection = (key: string, field: keyof HomepageSection, value: any) => {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === key ? { ...s, [field]: value } : s))
    );
  };

  const handleToggleSection = (key: string) => {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === key ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleUpdateHeroSlide = (productId: string, field: string, val: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionKey !== "hero") return s;
        let config: any = { slides: {} };
        if (s.customConfig) {
          try {
            config = JSON.parse(s.customConfig);
          } catch (e) {}
        }
        if (!config.slides) config.slides = {};
        if (!config.slides[productId]) config.slides[productId] = {};
        config.slides[productId][field] = val;
        return { ...s, customConfig: JSON.stringify(config) };
      })
    );
  };

  const handleUpdateBannerField = (index: number, field: keyof HeroBannerSlide, val: any) => {
    setHeroBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Include heroBanners in hero customConfig
      const updatedSections = sections.map((s) => {
        if (s.sectionKey === "hero") {
          let currentConfig: any = {};
          if (s.customConfig) {
            try {
              currentConfig = JSON.parse(s.customConfig);
            } catch (e) {}
          }
          currentConfig.customBanners = heroBanners;
          return {
            ...s,
            customConfig: JSON.stringify(currentConfig),
          };
        }
        return s;
      });

      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      showToast("Seluruh pengaturan section & foto homepage berhasil disimpan!");
      fetchSections();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const sectionLabels: Record<string, string> = {
    announcement: "1. Announcement Bar (Pengumuman Atas)",
    hero: "2. Hero Slider Banner (Banner Utama Beranda — 5 Slide)",
    categories: "3. Kategori Produk (Pastel, Risol, Bolu, dll)",
    featured: "4. Menu Best Seller & Promo Terfavorit",
    promo_banner: "5. Banner Promosi Khusus (Paket Snack Box)",
    value_props: "6. Keunggulan Toko (Bahan Alami & Higienis)",
    about: "7. Kisah & Filosofi Kami (Tentang Kami)",
    gallery: "8. Galeri Koleksi Foto Produk",
    testimonials: "9. Ulasan & Testimoni Pelanggan",
    faq: "10. Pertanyaan yang Sering Diajukan (FAQ)",
    cta: "11. Call to Action (CTA WhatsApp Pemesanan)",
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-600/30 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Visual Homepage Builder CMS
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Ubah teks, banner slider, foto produk yang Anda upload sendiri dari komputer, dan aktifkan/nonaktifkan section secara visual.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* SAMA PERSIS DI TAB YANG SAMA (NO target=_blank) */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            <Eye className="w-4 h-4 text-[#4A0E4E]" />
            <span>Lihat Website Toko</span>
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:bg-stone-400"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Menyimpan..." : "Publikasikan Perubahan"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sections Accordion List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Memuat konfigurasi homepage...</div>
      ) : (
        <div className="space-y-4">
          {sections.map((sec) => {
            const isExpanded = expandedKey === sec.sectionKey;
            const label = sectionLabels[sec.sectionKey] || sec.sectionKey;

            return (
              <div
                key={sec.sectionKey}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Section Bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-stone-50/50 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSection(sec.sectionKey)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        sec.isEnabled ? "bg-emerald-600" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          sec.isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>

                    <div>
                      <h2 className="font-bold text-stone-900 text-sm font-heading">{label}</h2>
                      <span className="text-[10px] text-stone-400 block">
                        Status:{" "}
                        <strong className={sec.isEnabled ? "text-emerald-700" : "text-stone-400"}>
                          {sec.isEnabled ? "Aktif (Tampil)" : "Nonaktif (Disembunyikan)"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : sec.sectionKey)}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Form Fields Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6 text-xs bg-white animate-fadeIn">
                    {/* KHUSUS HERO SECTION: FITUR UNGGAH FOTO SENDIRI DARI KOMPUTER UNTUK 5 BANNER SLIDER */}
                    {sec.sectionKey === "hero" && (
                      <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-[#4A0E4E] text-white rounded-xl">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-stone-900 text-sm font-heading">
                                Kelola 5 Banner Slider Beranda &amp; Unggah Foto Sendiri
                              </h3>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Anda dapat mengunggah foto langsung dari laptop/HP Anda untuk mengganti gambar banner pembukaan di beranda.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* List of 5 Hero Slides */}
                        <div className="space-y-4">
                          {heroBanners.map((slide, idx) => {
                            const isThisUploading = uploadingTarget === `hero-slide-${idx}`;

                            return (
                              <div
                                key={slide.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4"
                              >
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span className="font-bold text-sm text-[#4A0E4E] font-heading">
                                    Slide #{idx + 1}: {slide.title}
                                  </span>
                                  <span className="text-[10px] bg-[#4A0E4E]/10 text-[#4A0E4E] font-bold px-2 py-0.5 rounded-full">
                                    {slide.badge}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                  {/* Preview Image */}
                                  <div className="md:col-span-4 aspect-16/9 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={slide.desktopImg}
                                      alt={slide.title}
                                      className="w-full h-full object-cover"
                                    />
                                    {isThisUploading && (
                                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1">
                                        <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                                        <span>Mengunggah...</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Controls & Inputs */}
                                  <div className="md:col-span-8 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block font-semibold text-gray-700 mb-1">
                                          Judul Banner:
                                        </label>
                                        <input
                                          type="text"
                                          value={slide.title}
                                          onChange={(e) =>
                                            handleUpdateBannerField(idx, "title", e.target.value)
                                          }
                                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-800"
                                        />
                                      </div>
                                      <div>
                                        <label className="block font-semibold text-gray-700 mb-1">
                                          Badge Teks:
                                        </label>
                                        <input
                                          type="text"
                                          value={slide.badge}
                                          onChange={(e) =>
                                            handleUpdateBannerField(idx, "badge", e.target.value)
                                          }
                                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-medium"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block font-semibold text-gray-700 mb-1">
                                        Sub-judul / Deskripsi Banner:
                                      </label>
                                      <input
                                        type="text"
                                        value={slide.subtitle}
                                        onChange={(e) =>
                                          handleUpdateBannerField(idx, "subtitle", e.target.value)
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                                      />
                                    </div>

                                    {/* File Upload Button from Local Computer */}
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                      <div>
                                        <span className="font-bold text-gray-800 block text-xs">
                                          Unggah Foto Baru dari Komputer / HP:
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                          Mendukung JPG, PNG, WebP (Rasio ideal 16:9)
                                        </span>
                                      </div>

                                      <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all text-xs shrink-0">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Pilih File Foto</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleFileUpload(
                                                file,
                                                (url) => {
                                                  handleUpdateBannerField(idx, "desktopImg", url);
                                                  handleUpdateBannerField(idx, "mobileImg", url);
                                                },
                                                `hero-slide-${idx}`
                                              );
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section Banner Upload (for Promo Banner, About) */}
                    {["promo_banner", "about"].includes(sec.sectionKey) && (
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <label className="block font-bold text-gray-800">
                          Foto Banner Section ({sec.sectionKey})
                        </label>

                        {sec.imageUrl && (
                          <div className="aspect-16/9 max-w-sm rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sec.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl cursor-pointer shadow-sm text-xs transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Unggah Foto dari Komputer</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (url) => handleUpdateSection(sec.sectionKey, "imageUrl", url),
                                    `sec-${sec.sectionKey}`
                                  );
                                }
                              }}
                            />
                          </label>

                          <span className="text-[11px] text-gray-400">atau masukkan URL langsung:</span>
                        </div>

                        <input
                          type="url"
                          value={sec.imageUrl || ""}
                          onChange={(e) =>
                            handleUpdateSection(sec.sectionKey, "imageUrl", e.target.value)
                          }
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                        />
                      </div>
                    )}

                    {/* Standard Section Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Judul Section</label>
                        <input
                          type="text"
                          value={sec.title || ""}
                          onChange={(e) => handleUpdateSection(sec.sectionKey, "title", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Sub-judul / Tagline</label>
                        <input
                          type="text"
                          value={sec.subtitle || ""}
                          onChange={(e) => handleUpdateSection(sec.sectionKey, "subtitle", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Deskripsi Tambahan</label>
                      <textarea
                        rows={2}
                        value={sec.description || ""}
                        onChange={(e) => handleUpdateSection(sec.sectionKey, "description", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300"
                      />
                    </div>

                    {/* Buttons Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Teks Tombol Utama</label>
                        <input
                          type="text"
                          value={sec.buttonText || ""}
                          onChange={(e) => handleUpdateSection(sec.sectionKey, "buttonText", e.target.value)}
                          placeholder="Misal: Pesan Sekarang"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Tautan Tombol Utama</label>
                        <input
                          type="text"
                          value={sec.buttonLink || ""}
                          onChange={(e) => handleUpdateSection(sec.sectionKey, "buttonLink", e.target.value)}
                          placeholder="/produk atau https://wa.me/..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

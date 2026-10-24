"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Palette,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Save,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Eye,
  Check,
  UtensilsCrossed,
  ShieldCheck,
  Flame,
} from "lucide-react";

interface ThemePreset {
  name: string;
  desc: string;
  primary: string;
  secondary: string;
  bg: string;
  surface: string;
  accent: string;
  text: string;
}

interface BackgroundSwatch {
  name: string;
  hex: string;
  desc: string;
  isDark?: boolean;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Warm Bakery & Chocolate",
    desc: "Cokelat hangat khas bakery tradisional (Default)",
    primary: "#4B291B",
    secondary: "#A9683B",
    bg: "#FAF5EF",
    surface: "#FFFDF9",
    accent: "#EBD9C7",
    text: "#211A16",
  },
  {
    name: "Royal Purple & Golden Amber",
    desc: "Ungu bangsawan elegan dipadu kilau emas",
    primary: "#4A0E4E",
    secondary: "#F59E0B",
    bg: "#FAF5FF",
    surface: "#FFFFFF",
    accent: "#F3E8FF",
    text: "#0F172A",
  },
  {
    name: "Matcha Pastry & Green",
    desc: "Hijau teh matcha alami yang segar dan menyejukkan",
    primary: "#1E3F20",
    secondary: "#4E8752",
    bg: "#F4F8F4",
    surface: "#FFFFFF",
    accent: "#E3ECE3",
    text: "#142516",
  },
  {
    name: "Sweet Berry Velvet",
    desc: "Nuansa red velvet manis & feminin",
    primary: "#881337",
    secondary: "#E11D48",
    bg: "#FFF1F2",
    surface: "#FFFFFF",
    accent: "#FFE4E6",
    text: "#1C1917",
  },
  {
    name: "Classic Cafe Mocha",
    desc: "Kopi mocha klasik dengan aksen susu karamel",
    primary: "#291811",
    secondary: "#82533D",
    bg: "#F8F5F2",
    surface: "#FFFFFF",
    accent: "#EADBCE",
    text: "#1D140E",
  },
  {
    name: "Ocean Frost & Clean",
    desc: "Nuansa biru laut segar, bersih, dan modern",
    primary: "#0F3854",
    secondary: "#0284C7",
    bg: "#F0F9FF",
    surface: "#FFFFFF",
    accent: "#E0F2FE",
    text: "#0F172A",
  },
  {
    name: "Honey & Butter Cream",
    desc: "Kuning keemasan manis hangat yang menggugah selera",
    primary: "#78350F",
    secondary: "#D97706",
    bg: "#FFFBEB",
    surface: "#FFFFFF",
    accent: "#FEF3C7",
    text: "#1C1917",
  },
  {
    name: "Minimalist Pure White",
    desc: "Tampilan bersih serba putih dengan aksen charcoal",
    primary: "#18181B",
    secondary: "#52525B",
    bg: "#FFFFFF",
    surface: "#FAFAFA",
    accent: "#F4F4F5",
    text: "#09090B",
  },
  {
    name: "Luxury Midnight Gold",
    desc: "Hitam mewah eksklusif berpadu sentuhan emas",
    primary: "#18181B",
    secondary: "#D97706",
    bg: "#FAFAFA",
    surface: "#FFFFFF",
    accent: "#FEF3C7",
    text: "#09090B",
  },
];

const QUICK_BACKGROUND_SWATCHES: BackgroundSwatch[] = [
  { name: "Warm Cream", hex: "#FAF5EF", desc: "Krim hangat roti klasik" },
  { name: "Pure White", hex: "#FFFFFF", desc: "Putih bersih minimalis" },
  { name: "Soft Cloud", hex: "#F9FAFB", desc: "Abu-abu sangat lembut" },
  { name: "Matcha Pale", hex: "#F4F8F4", desc: "Hijau teh lembut segar" },
  { name: "Butter Warm", hex: "#FFFBEB", desc: "Kuning mentega lembut" },
  { name: "Blush Velvet", hex: "#FFF1F2", desc: "Merah muda manis elegan" },
  { name: "Soft Lavender", hex: "#FAF5FF", desc: "Ungu muda modern" },
  { name: "Ice Sky Blue", hex: "#F0F9FF", desc: "Biru langit segar" },
  { name: "Fresh Mint", hex: "#F0FDF4", desc: "Hijau mint sejuk" },
  { name: "Warm Peach", hex: "#FFF7ED", desc: "Peach hangat ramah" },
  { name: "Slate Cool", hex: "#F8FAFC", desc: "Abu slate profesional" },
  { name: "Luxury Dark", hex: "#18181B", desc: "Mode gelap eksklusif", isDark: true },
];

export default function AdminThemePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme states
  const [primaryColor, setPrimaryColor] = useState("#4B291B");
  const [secondaryColor, setSecondaryColor] = useState("#A9683B");
  const [backgroundColor, setBackgroundColor] = useState("#FAF5EF");
  const [surfaceColor, setSurfaceColor] = useState("#FFFDF9");
  const [accentColor, setAccentColor] = useState("#EBD9C7");
  const [textColor, setTextColor] = useState("#211A16");

  const fetchTheme = async () => {
    try {
      const res = await fetch("/api/admin/theme");
      const data = await res.json();
      if (data.theme) {
        setPrimaryColor(data.theme.primaryColor || "#4B291B");
        setSecondaryColor(data.theme.secondaryColor || "#A9683B");
        setBackgroundColor(data.theme.backgroundColor || "#FAF5EF");
        setSurfaceColor(data.theme.surfaceColor || "#FFFDF9");
        setAccentColor(data.theme.accentColor || "#EBD9C7");
        setTextColor(data.theme.textColor || "#211A16");
      }
    } catch (e) {
      console.error("Gagal memuat tema:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const applyPreset = (preset: ThemePreset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setBackgroundColor(preset.bg);
    setSurfaceColor(preset.surface);
    setAccentColor(preset.accent);
    setTextColor(preset.text);
    showToast(`Preset "${preset.name}" dipilih! Klik "Terapkan & Simpan Warna" untuk mengaktifkan ke Vercel.`);
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          secondaryColor,
          backgroundColor,
          surfaceColor,
          accentColor,
          textColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan tema.");

      // Apply dynamically to current window if needed
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        root.style.setProperty("--color-primary", primaryColor);
        root.style.setProperty("--color-secondary", secondaryColor);
        root.style.setProperty("--color-bg", backgroundColor);
        root.style.setProperty("--color-surface", surfaceColor);
        root.style.setProperty("--color-accent", accentColor);
        root.style.setProperty("--color-text", textColor);
        window.dispatchEvent(new Event("theme-updated"));
      }

      showToast("Tema warna dan latar belakang berhasil disimpan dan aktif di website!");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan tema.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    applyPreset(THEME_PRESETS[0]);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <Link
            href="/"
            target="_blank"
            className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition"
          >
            <span>Buka Web</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5 text-amber-700" />
            <span>Kustomisasi Tampilan Web</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            Warna &amp; Latar Belakang Website Utama
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Sesuaikan palet warna toko dan warna background seluruh halaman web secara leluasa. Perubahan otomatis tersimpan ke database Neon dan langsung terupdate di link Vercel Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Web Live</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200/80">
          Memuat konfigurasi tema...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Konfigurasi (Kiri 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Preset Pilihan 1-Click */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h2 className="font-bold text-sm text-slate-900">
                    Preset Tema Pilihan (1-Klik)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {THEME_PRESETS.map((p) => {
                  const isSelected =
                    primaryColor.toLowerCase() === p.primary.toLowerCase() &&
                    backgroundColor.toLowerCase() === p.bg.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/40 shadow-xs ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                        {p.desc}
                      </p>

                      {/* Color dots preview */}
                      <div className="flex items-center gap-1 pt-1">
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: p.primary }}
                          title="Brand Primary"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: p.secondary }}
                          title="Secondary"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: p.bg }}
                          title="Background"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: p.surface }}
                          title="Surface Card"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Pickers Manual & Background Swatches */}
            <form onSubmit={handleSaveTheme} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-bold text-sm text-slate-900">
                  Pengaturan Palet &amp; Background Manual
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sesuaikan warna secara presisi menggunakan Color Picker, tombol pilihan cepat, atau masukkan kode HEX custom Anda.
                </p>
              </div>

              {/* FITUR UTAMA: BACKGROUND COLOR CUSTOMIZER */}
              <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-amber-50/25 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10.5px] font-extrabold uppercase tracking-wide mb-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>Fitur Latar Belakang Website (Background)</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Warna Background Seluruh Halaman Toko
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      Warna ini menjadi dasar seluruh halaman beranda, katalog produk, dan area utama website.
                    </p>
                  </div>

                  {/* Manual picker for background */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shadow-2xs"
                      title="Klik untuk memilih warna background custom"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 bg-white"
                      placeholder="#FAF5EF"
                    />
                  </div>
                </div>

                {/* Quick Swatches Buttons */}
                <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-700">
                      Pilihan Cepat Warna Background Populer:
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">
                      Klik salah satu untuk langsung mencoba
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {QUICK_BACKGROUND_SWATCHES.map((swatch) => {
                      const isSelected = backgroundColor.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.name}
                          type="button"
                          onClick={() => setBackgroundColor(swatch.hex)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? "border-amber-600 bg-white shadow-xs ring-2 ring-amber-500/30"
                              : "border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-lg border border-black/15 shrink-0 shadow-2xs flex items-center justify-center"
                            style={{ backgroundColor: swatch.hex }}
                          >
                            {isSelected && (
                              <Check
                                className={`w-3 h-3 stroke-[3] ${
                                  swatch.isDark ? "text-white" : "text-amber-800"
                                }`}
                              />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] font-bold text-slate-900 truncate">
                              {swatch.name}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              {swatch.hex}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* OTHER PALETTE CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Utama (Brand Primary)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna tombol belanja, banner hero, logo toko, dan elemen utama.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#4B291B"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Sekunder (Secondary)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna badge diskon, aksen sorotan, dan ikon pendukung.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#A9683B"
                    />
                  </div>
                </div>

                {/* Surface / Card Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Kartu &amp; Navbar (Surface)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna latar belakang kartu produk, navbar melayang, dan keranjang.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={surfaceColor}
                      onChange={(e) => setSurfaceColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={surfaceColor}
                      onChange={(e) => setSurfaceColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#FFFDF9"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Aksen Halus (Soft Accent)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna latar badge kategori lembut, pill tag, dan highlight.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#EBD9C7"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Teks Utama (Typography)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna tulisan paragraf, deskripsi produk, judul kartu, dan label toko.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-36 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#211A16"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Reset Default
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menerapkan ke Vercel..." : "Terapkan & Simpan Warna"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Simulator & Live Preview Beranda (Kanan 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Live Simulator Beranda Toko
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Latar:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border border-slate-200 bg-white shadow-2xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor }}
                    />
                    <span>{backgroundColor}</span>
                  </span>
                </div>
              </div>

              {/* Simulator Screen Container with the dynamic background color */}
              <div
                className="rounded-2xl p-3.5 border border-slate-200 transition-colors duration-300 space-y-3 shadow-inner"
                style={{ backgroundColor }}
              >
                {/* 1. Mini Navbar */}
                <div
                  className="rounded-xl px-3 py-2 shadow-xs border border-black/5 flex items-center justify-between transition-colors"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div
                        className="text-xs font-black leading-tight"
                        style={{ color: primaryColor }}
                      >
                        Dapur Rasa
                      </div>
                      <div className="text-[8px] text-slate-400 font-semibold uppercase leading-none">
                        Bakery &amp; Frozen
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{
                        backgroundColor: `${primaryColor}18`,
                        color: primaryColor,
                      }}
                    >
                      Beranda
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">Produk</span>
                  </div>
                </div>

                {/* 2. Mini Hero Banner */}
                <div
                  className="rounded-xl p-3.5 shadow-sm text-white relative overflow-hidden flex flex-col justify-between gap-3 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="space-y-1">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wide text-slate-900"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Kue Terlaris #1
                    </span>
                    <h4 className="text-sm font-black leading-tight">
                      Pastel Crispy &amp; Risol Mayo Lumer
                    </h4>
                    <p className="text-[9.5px] opacity-90 leading-tight">
                      Kerenyahan kulit berlapis dengan isian melimpah khas Dapur Rasa.
                    </p>
                  </div>

                  <div>
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs"
                      style={{ backgroundColor: surfaceColor, color: primaryColor }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Belanja Sekarang</span>
                    </span>
                  </div>
                </div>

                {/* 3. Mini Category Pills Row */}
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {["Pastel", "Risol Mayo", "Sosis Solo", "Brownies"].map((c, idx) => (
                    <span
                      key={c}
                      className="px-2 py-1 rounded-lg text-[8.5px] font-bold border border-black/5 whitespace-nowrap shadow-2xs"
                      style={{
                        backgroundColor: idx === 0 ? accentColor : surfaceColor,
                        color: idx === 0 ? primaryColor : textColor,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* 4. Mini Product Card 1 */}
                <div
                  className="rounded-xl p-2.5 shadow-xs border border-black/5 flex items-center gap-3 transition-colors"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div
                    className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-black/5"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&auto=format&fit=crop&q=80')",
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold"
                      style={{
                        backgroundColor: accentColor,
                        color: primaryColor,
                      }}
                    >
                      Best Seller
                    </span>
                    <div
                      className="text-[11px] font-bold truncate leading-tight"
                      style={{ color: textColor }}
                    >
                      Pastel Ayam Telur Sayur
                    </div>
                    <div
                      className="text-xs font-extrabold"
                      style={{ color: primaryColor }}
                    >
                      Rp 5.000
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold shadow-2xs shrink-0 cursor-default"
                    style={{ backgroundColor: primaryColor }}
                  >
                    + Beli
                  </button>
                </div>

                {/* 5. Mini Product Card 2 */}
                <div
                  className="rounded-xl p-2.5 shadow-xs border border-black/5 flex items-center gap-3 transition-colors"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div
                    className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-black/5"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80')",
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold"
                      style={{
                        backgroundColor: accentColor,
                        color: primaryColor,
                      }}
                    >
                      Fudgy
                    </span>
                    <div
                      className="text-[11px] font-bold truncate leading-tight"
                      style={{ color: textColor }}
                    >
                      Brownies Panggang Cokelat
                    </div>
                    <div
                      className="text-xs font-extrabold"
                      style={{ color: primaryColor }}
                    >
                      Rp 45.000
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold shadow-2xs shrink-0 cursor-default"
                    style={{ backgroundColor: primaryColor }}
                  >
                    + Beli
                  </button>
                </div>

                {/* 6. Mini Trust Badge */}
                <div
                  className="rounded-xl p-2 shadow-2xs border border-black/5 flex items-center justify-between text-[8.5px] font-semibold"
                  style={{ backgroundColor: surfaceColor, color: textColor }}
                >
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Halal &amp; Higienis</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Fresh Tiap Hari</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sinkronisasi Otomatis ke Vercel</span>
                </div>
                <p>
                  Saat Anda menekan tombol <span className="font-bold">Terapkan &amp; Simpan Warna</span>, tema dan warna background akan tersimpan ke database Neon dan langsung terupdate di seluruh halaman publik tanpa perlu deploy ulang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

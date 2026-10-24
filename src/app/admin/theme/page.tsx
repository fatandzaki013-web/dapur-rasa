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
    setTimeout(() => setToastMessage(null), 4000);
  };

  const applyPreset = (preset: ThemePreset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setBackgroundColor(preset.bg);
    setSurfaceColor(preset.surface);
    setAccentColor(preset.accent);
    setTextColor(preset.text);
    showToast(`Preset "${preset.name}" dipilih! Klik Simpan untuk menerapkan.`);
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

      showToast("Tema warna berhasil disimpan dan diterapkan ke seluruh website!");
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
            <span>Lihat Web</span>
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
            Warna &amp; Tema Website Utama
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ubah palet warna website toko secara langsung. Warna yang Anda pilih di sini akan langsung mengubah tampilan tombol, navbar, banner, dan seluruh halaman beranda toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Pratinjau Web Utama</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((p) => {
                  const isSelected =
                    primaryColor.toLowerCase() === p.primary.toLowerCase() &&
                    backgroundColor.toLowerCase() === p.bg.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/40 shadow-xs ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-slate-900 leading-snug">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        {p.desc}
                      </p>

                      {/* Color dots */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: p.primary }}
                          title="Primary"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: p.secondary }}
                          title="Secondary"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: p.bg }}
                          title="Background"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: p.accent }}
                          title="Accent"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Pickers Manual */}
            <form onSubmit={handleSaveTheme} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-bold text-sm text-slate-900">
                  Pengaturan Palet Warna Manual
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sesuaikan warna secara presisi menggunakan Color Picker atau kode HEX.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Utama (Brand Primary)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna tombol belanja, logo toko, teks judul utama, dan badge terlaris.
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
                    Warna aksen kedua, ikon sorotan, dan elemen dekoratif pelengkap.
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

                {/* Background Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Latar Belakang Web (Background)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna dasar seluruh halaman web toko pelanggan.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
                      placeholder="#FAF5EF"
                    />
                  </div>
                </div>

                {/* Surface / Card Color */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Kartu &amp; Navbar (Surface)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna latar belakang kartu produk, navbar atas, dan modal.
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
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Warna Teks Utama (Typography)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Warna tulisan paragraf, deskripsi produk, dan label keterangan.
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
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-800 bg-white"
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
                  <span>{isSaving ? "Menerapkan ke Web..." : "Terapkan & Simpan Warna"}</span>
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
                <span className="text-[10px] text-slate-400 font-medium">Realtime Preview</span>
              </div>

              {/* Simulator Screen Container */}
              <div
                className="rounded-2xl p-3 border border-slate-200 transition-colors duration-300 space-y-3 shadow-inner"
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
                  className="rounded-xl p-3.5 shadow-sm text-white relative overflow-hidden flex flex-col justify-between gap-3"
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

                {/* 3. Mini Product Card */}
                <div
                  className="rounded-xl p-2.5 shadow-xs border border-black/5 flex items-center gap-3"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 border border-black/5"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&auto=format&fit=crop&q=80')",
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-1">
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
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">Tips Tampilan:</span> Saat Anda menekan tombol{" "}
                <span className="font-bold">Terapkan &amp; Simpan</span>, palet ini langsung aktif di seluruh website live Anda.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

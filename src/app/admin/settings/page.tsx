"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Save, CheckCircle, AlertCircle, Palette, Settings, RotateCcw } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "theme">("store");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store Settings State
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [operationalHours, setOperationalHours] = useState("");
  const [defaultShippingFee, setDefaultShippingFee] = useState<number | string>(15000);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Theme Config State
  const [primaryColor, setPrimaryColor] = useState("#4B291B");
  const [secondaryColor, setSecondaryColor] = useState("#A9683B");
  const [backgroundColor, setBackgroundColor] = useState("#FAF5EF");
  const [surfaceColor, setSurfaceColor] = useState("#FFFDF9");
  const [accentColor, setAccentColor] = useState("#EBD9C7");
  const [textColor, setTextColor] = useState("#211A16");

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/theme"),
      ]);

      const sData = await sRes.json();
      const tData = await tRes.json();

      if (sData.settings) {
        setBrandName(sData.settings.brandName || "");
        setTagline(sData.settings.tagline || "");
        setWhatsappNumber(sData.settings.whatsappNumber || "");
        setAddress(sData.settings.address || "");
        setOperationalHours(sData.settings.operationalHours || "");
        setDefaultShippingFee(sData.settings.defaultShippingFee ?? 15000);
        setMinOrderAmount(sData.settings.minOrderAmount ?? 0);
        setMetaTitle(sData.settings.metaTitle || "");
        setMetaDescription(sData.settings.metaDescription || "");
      }

      if (tData.theme) {
        setPrimaryColor(tData.theme.primaryColor || "#4B291B");
        setSecondaryColor(tData.theme.secondaryColor || "#A9683B");
        setBackgroundColor(tData.theme.backgroundColor || "#FAF5EF");
        setSurfaceColor(tData.theme.surfaceColor || "#FFFDF9");
        setAccentColor(tData.theme.accentColor || "#EBD9C7");
        setTextColor(tData.theme.textColor || "#211A16");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchData().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          tagline,
          whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ""),
          address,
          operationalHours,
          defaultShippingFee: Number(defaultShippingFee),
          minOrderAmount: Number(minOrderAmount),
          metaTitle,
          metaDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");

      showToast("Pengaturan toko berhasil diperbarui!");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal.");
    } finally {
      setIsSaving(false);
    }
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
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");

      showToast("Tema palet warna website berhasil diterapkan!");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetThemeToDefault = () => {
    setPrimaryColor("#4B291B");
    setSecondaryColor("#A9683B");
    setBackgroundColor("#FAF5EF");
    setSurfaceColor("#FFFDF9");
    setAccentColor("#EBD9C7");
    setTextColor("#211A16");
    showToast("Warna dikembalikan ke tema default Warm Bakery!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-600/30 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Pengaturan Toko & Konfigurasi Tema
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Atur nomor WhatsApp resmi, ongkos kirim, dan kustomisasi palet warna toko secara terpusat.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("store")}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "store"
              ? "border-amber-700 text-amber-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Bisnis & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab("theme")}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "theme"
              ? "border-amber-700 text-amber-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Palet Warna & Tema Desain</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Memuat konfigurasi...</div>
      ) : activeTab === "store" ? (
        <form onSubmit={handleSaveStore} className="space-y-6 text-xs">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b pb-2">
              Pengaturan WhatsApp & Operasional
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor WhatsApp Toko (Format 62...) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Penting: Pastikan menggunakan kode negara 62 (tanpa tanda + atau spasi) agar tautan chat langsung terbuka.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Brand Toko
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Dapur Rasa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tarif Standar Ongkos Kirim (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultShippingFee}
                  onChange={(e) => setDefaultShippingFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Batas Minimal Pemesanan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0 jika tidak ada minimal"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Alamat Toko / Dapur</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Mawar Melati No. 12, Jakarta"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jam Buka Dapur</label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  placeholder="Senin - Sabtu: 08:00 - 18:00 WIB"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-semibold text-stone-700 mb-1">SEO Title Website</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Dapur Rasa | Toko Kue Rumahan Lezat & Higienis"
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">SEO Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Pesan aneka kue basah, pastel renyah, risol mayo lumer untuk acara dan arisan..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
              >
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan Toko"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveTheme} className="space-y-6 text-xs">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <span className="font-bold text-amber-900 block text-xs">Studio Kustomisasi Warna & Live Simulator</span>
                <span className="text-[11px] text-amber-800">Ubah palet warna dengan preset 1-klik dan simulator beranda toko secara realtime.</span>
              </div>
              <Link
                href="/admin/theme"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs shrink-0 transition"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Buka Studio Tema</span>
              </Link>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-heading font-bold text-base text-stone-900">
                  Palet Warna Tema Website
                </h2>
                <p className="text-[11px] text-stone-500">
                  Warna ini diterapkan secara dinamis ke seluruh tombol, latar belakang, dan aksen website pelanggan.
                </p>
              </div>

              <button
                type="button"
                onClick={resetThemeToDefault}
                className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Default Bakery Palette</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Warna Utama (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #4B291B (Cocoa Brown)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Warna Sekunder (Secondary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #A9683B (Caramel)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Latar Belakang (Background)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #FAF5EF (Warm Cream)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Permukaan Kartu (Surface)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={surfaceColor}
                    onChange={(e) => setSurfaceColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={surfaceColor}
                    onChange={(e) => setSurfaceColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #FFFDF9 (Ivory)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Warna Aksen (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #EBD9C7 (Soft Beige)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Warna Teks (Text)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-400 block">Default: #211A16 (Dark Charcoal)</span>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-5 rounded-2xl border border-stone-200 space-y-3" style={{ backgroundColor }}>
              <span className="text-[11px] font-bold text-stone-500 uppercase">
                Pratinjau Langsung Kombinasi Warna:
              </span>
              <div
                className="p-4 rounded-xl shadow-xs border flex items-center justify-between"
                style={{ backgroundColor: surfaceColor, borderColor: accentColor }}
              >
                <div>
                  <h4 className="font-heading font-bold text-sm" style={{ color: primaryColor }}>
                    Contoh Kartu Pastel Ayam Dapur Rasa
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: textColor }}>
                    Kulit renyah gurih, isian telur dan daging ayam melimpah.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  Beli Kue
                </button>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
              >
                {isSaving ? "Menyimpan..." : "Terapkan Palet Warna"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

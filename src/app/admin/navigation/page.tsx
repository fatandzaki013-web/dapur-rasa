"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle, AlertCircle, Compass, Upload, Image as ImageIcon } from "lucide-react";

export default function AdminNavigationPage() {
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [operationalHours, setOperationalHours] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setBrandName(data.settings.brandName || "");
          setTagline(data.settings.tagline || "");
          setLogoUrl(data.settings.logoUrl || "");
          setAddress(data.settings.address || "");
          setOperationalHours(data.settings.operationalHours || "");
          setInstagramUrl(data.settings.instagramUrl || "");
          setFacebookUrl(data.settings.facebookUrl || "");
          setTiktokUrl(data.settings.tiktokUrl || "");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        clearTimeout(timer);
        setIsLoading(false);
      });
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
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
          logoUrl,
          address,
          operationalHours,
          instagramUrl,
          facebookUrl,
          tiktokUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");

      showToast("Pengaturan Header, Footer & Identitas Brand berhasil diperbarui!");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Header, Footer & Identitas Brand
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Ganti nama toko, slogan, logo visual, kontak operasional, dan tautan media sosial.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:bg-stone-400"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Card 1: Brand Header */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b pb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>Identitas Brand & Header Toko</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Brand Toko <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Dapur Rasa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Kue & Camilan Rumahan Kualitas Premium"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                URL Logo Toko (Opsional)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Jika dikosongkan, sistem akan otomatis menggunakan ikon resmi Dapur Rasa yang elegan.
              </span>
            </div>
          </div>

          {/* Card 2: Footer & Kontak */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b pb-2">
              Informasi Footer & Operasional
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Alamat Dapur</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Perumahan Griya Cileungsi 5 Blok A8 No. 01, Cileungsi, Jawa Barat"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jam Operasional</label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  placeholder="Senin - Sabtu: 05.00 - 22.00 WIB (Minggu: Tutup)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/dapurrasa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/dapurrasa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@dapurrasa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  Palette,
  Settings,
  RotateCcw,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "account" | "theme">("store");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store Settings State
  const [brandName, setBrandName] = useState("Dapur Rasa");
  const [tagline, setTagline] = useState("Kue & Camilan Rumahan Kualitas Premium");
  const [whatsappNumber, setWhatsappNumber] = useState("6285888159765");
  const [address, setAddress] = useState(
    "Perumahan Griya Cileungsi 5 Blok A8 No. 01, Cileungsi, Jawa Barat"
  );
  const [operationalHours, setOperationalHours] = useState(
    "Setiap Hari: 07:00 - 20:00 WIB"
  );
  const [defaultShippingFee, setDefaultShippingFee] = useState<number | string>(0);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
  const [metaTitle, setMetaTitle] = useState("Dapur Rasa | Toko Kue Rumahan Lezat & Higienis");
  const [metaDescription, setMetaDescription] = useState(
    "Pesan aneka kue basah, pastel renyah, risol mayo lumer, brownies legit, dan snack box lezat Dapur Rasa."
  );

  // Admin Account & Password State
  const [adminName, setAdminName] = useState("Admin Dapur Rasa");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Theme Config State
  const [primaryColor, setPrimaryColor] = useState("#4A0E4E");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");
  const [backgroundColor, setBackgroundColor] = useState("#FAF5EF");
  const [surfaceColor, setSurfaceColor] = useState("#FFFDF9");
  const [accentColor, setAccentColor] = useState("#EBD9C7");
  const [textColor, setTextColor] = useState("#211A16");

  const fetchData = async () => {
    try {
      const [sRes, tRes, pRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/theme"),
        fetch("/api/admin/profile"),
      ]);

      const sData = await sRes.json();
      const tData = await tRes.json();
      const pData = await pRes.json();

      if (sData.settings) {
        setBrandName(sData.settings.brandName || "Dapur Rasa");
        setTagline(sData.settings.tagline || "Kue & Camilan Rumahan Kualitas Premium");
        setWhatsappNumber(sData.settings.whatsappNumber || "6285888159765");
        setAddress(
          sData.settings.address ||
            "Perumahan Griya Cileungsi 5 Blok A8 No. 01, Cileungsi, Jawa Barat"
        );
        setOperationalHours(
          sData.settings.operationalHours || "Setiap Hari: 07:00 - 20:00 WIB"
        );
        setDefaultShippingFee(sData.settings.defaultShippingFee ?? 0);
        setMinOrderAmount(sData.settings.minOrderAmount ?? 0);
        setMetaTitle(sData.settings.metaTitle || "");
        setMetaDescription(sData.settings.metaDescription || "");
      }

      if (tData.theme) {
        setPrimaryColor(tData.theme.primaryColor || "#4A0E4E");
        setSecondaryColor(tData.theme.secondaryColor || "#F59E0B");
        setBackgroundColor(tData.theme.backgroundColor || "#FAF5EF");
        setSurfaceColor(tData.theme.surfaceColor || "#FFFDF9");
        setAccentColor(tData.theme.accentColor || "#EBD9C7");
        setTextColor(tData.theme.textColor || "#211A16");
      }

      if (pData.user) {
        setAdminName(pData.user.name || "Admin Dapur Rasa");
        setAdminUsername(pData.user.username || "admin");
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

  // Simpan Pengaturan Toko
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
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan toko.");

      showToast("Pengaturan profil & kontak toko berhasil diperbarui!");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan pengaturan toko.");
    } finally {
      setIsSaving(false);
    }
  };

  // Simpan Akun & Ganti Password Admin
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const cleanUsername = adminUsername.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage("Username harus terdiri dari minimal 3 karakter.");
      setIsSaving(false);
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage("Kata sandi baru minimal 6 karakter.");
        setIsSaving(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
        setIsSaving(false);
        return;
      }

      if (!currentPassword) {
        setErrorMessage("Masukkan kata sandi lama Anda untuk konfirmasi keamanan.");
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName.trim(),
          username: cleanUsername,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui akun.");

      showToast("Username & kata sandi admin berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memperbarui akun.");
    } finally {
      setIsSaving(false);
    }
  };

  // Simpan Palet Warna Tema
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

      showToast("Tema warna website berhasil diterapkan!");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetThemeToDefault = () => {
    setPrimaryColor("#4A0E4E");
    setSecondaryColor("#F59E0B");
    setBackgroundColor("#FAF5EF");
    setSurfaceColor("#FFFDF9");
    setAccentColor("#EBD9C7");
    setTextColor("#211A16");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#4A0E4E] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn border border-amber-400/40">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#4A0E4E] font-bold">Pengaturan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pusat Pengaturan Toko &amp; Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola profil toko, nomor WhatsApp pesanan, alamat, dan ganti username &amp; password login Anda.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("store");
            setErrorMessage(null);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "store"
              ? "border-[#4A0E4E] text-[#4A0E4E] bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Profil Toko &amp; WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("account");
            setErrorMessage(null);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "account"
              ? "border-[#4A0E4E] text-[#4A0E4E] bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Ganti Username &amp; Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("theme");
            setErrorMessage(null);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "theme"
              ? "border-[#4A0E4E] text-[#4A0E4E] bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Palet Warna Website</span>
        </button>
      </div>

      {/* Tab 1: Pengaturan Toko */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border">
          Memuat konfigurasi...
        </div>
      ) : activeTab === "store" ? (
        <form onSubmit={handleSaveStore} className="space-y-6 text-xs sm:text-sm">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#4A0E4E]" />
                  <span>Informasi Kontak &amp; Operasional Toko</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengaturan ini langsung tampil di website pembeli (header, footer, dan tautan checkout WhatsApp).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Nomor WhatsApp Toko (Awali 62...) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="6285888159765"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  * Otomatis menerima pesan pemesanan checkout dari pembeli dan menjadi nomor GoPay default.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Nama Brand Toko
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Dapur Rasa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                Alamat Toko / Dapur Produksi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Perumahan Griya Cileungsi 5 Blok A8 No. 01, Cileungsi, Jawa Barat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Alamat ini tampil di footer website dan petunjuk titik ambil pesanan pelanggan.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Jam Buka Dapur
                </label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  placeholder="Setiap Hari: 07:00 - 20:00 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Slogan / Tagline Toko
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Kue & Camilan Rumahan Kualitas Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Tarif Standar Ongkos Kirim (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultShippingFee}
                  onChange={(e) => setDefaultShippingFee(e.target.value)}
                  placeholder="0 untuk gratis ongkir"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Isi 0 jika pengantaran ke area Perum Griya Cileungsi 5 adalah Gratis Ongkir.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Batas Minimal Pemesanan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0 jika tidak ada batas minimal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                Judul Website di Google (SEO Title)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Dapur Rasa | Toko Kue Rumahan Lezat & Higienis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                Deskripsi Singkat Website (SEO Description)
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Pesan aneka kue basah, pastel renyah, risol mayo lumer untuk acara dan kumpul keluarga..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan Toko"}</span>
              </button>
            </div>
          </div>
        </form>
      ) : activeTab === "account" ? (
        /* Tab 2: Akun & Ganti Password Admin */
        <form onSubmit={handleSaveAccount} className="space-y-6 text-xs sm:text-sm">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#4A0E4E]" />
                <span>Ganti Username &amp; Kata Sandi Akun Admin</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Anda dapat mengubah username akun login dan mengganti kata sandi kapan saja demi keamanan.
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs text-[#4A0E4E] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4A0E4E] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Petunjuk Keamanan Akun:</span>
                <p className="text-purple-900/80 leading-relaxed">
                  Username dan kata sandi baru akan langsung aktif setelah Anda klik <strong>Simpan Perubahan Akun</strong>. Pastikan Anda mengingat atau mencatat kredensial baru tersebut untuk login berikutnya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Nama Lengkap Admin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Dapur Rasa"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Hanya huruf, angka, underscore (_), atau titik (.).
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Ganti Kata Sandi (Opsional)
              </h3>
              <p className="text-xs text-slate-400">
                Biarkan kolom kata sandi baru kosong jika Anda hanya ingin mengubah Nama atau Username saja.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                    Ulangi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                    />
                  </div>
                </div>
              </div>

              {newPassword && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                    Kata Sandi Lama / Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-md">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required={!!newPassword}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Diperlukan untuk memvalidasi perubahan kata sandi baru.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan Akun & Sandi"}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Tab 3: Palet Warna */
        <form onSubmit={handleSaveTheme} className="space-y-6 text-xs sm:text-sm">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 p-4 rounded-2xl border border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#4A0E4E] block text-xs sm:text-sm">
                  Studio Kustomisasi Warna Website
                </span>
                <span className="text-xs text-slate-600">
                  Ubah palet warna website secara realtime untuk menyesuaikan identitas visual Dapur Rasa.
                </span>
              </div>
              <Link
                href="/admin/theme"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-xs shadow-xs shrink-0 transition"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Buka Studio Tema Lengkap</span>
              </Link>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  Palet Warna Tema Utama
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Warna ini diterapkan secara dinamis ke seluruh tombol, latar belakang, dan aksen website pelanggan.
                </p>
              </div>

              <button
                type="button"
                onClick={resetThemeToDefault}
                className="text-[#4A0E4E] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Warna Default Toko</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200">
                <label className="block font-semibold text-slate-700 text-xs">Warna Utama (Primary)</label>
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Default: #4A0E4E (Dapur Rasa Purple)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200">
                <label className="block font-semibold text-slate-700 text-xs">Warna Aksen (Secondary/Gold)</label>
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Default: #F59E0B (Warm Golden)</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200">
                <label className="block font-semibold text-slate-700 text-xs">Latar Belakang (Background)</label>
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Default: #FAF5EF (Warm Cream)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Palet Warna"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

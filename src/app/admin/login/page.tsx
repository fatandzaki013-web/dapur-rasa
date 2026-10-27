"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset error state on mount
  React.useEffect(() => {
    setErrorMessage(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage("Silakan isi username dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal. Periksa kembali username dan kata sandi.");
      }

      // Hard redirect to flush cookies into browser session and cleanly mount AdminLayout
      window.location.href = "/admin";
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kendala saat login. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-slate-50 to-stone-100/60 flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows (warm bakery accents matching frontend) */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-100/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-100/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="relative w-full max-w-md mx-auto z-10 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-9">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4A0E4E] text-white shadow-md shadow-[#4A0E4E]/20 mb-3.5 hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-amber-200" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Portal Administrasi Resmi</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Pusat Kendali <span className="text-[#4A0E4E]">Dapur Rasa</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Silakan masukkan akun admin resmi untuk mengelola pesanan, stok produk, dan operasional website.
            </p>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#4A0E4E] focus:ring-4 focus:ring-[#4A0E4E]/10 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#4A0E4E] focus:ring-4 focus:ring-[#4A0E4E]/10 transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 sm:py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md shadow-[#4A0E4E]/20 flex items-center justify-center gap-2 transition-all duration-200 ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed opacity-90"
                    : "bg-[#4A0E4E] hover:bg-[#3D0840] hover:shadow-lg active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                    <span>Memeriksa Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security note & Store Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Sesi Terenkripsi &amp; Aman</span>
            </span>
            <Link
              href="/"
              className="font-bold text-[#4A0E4E] hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Ke Toko Pelanggan</span>
            </Link>
          </div>
        </div>

        {/* Outer footer note */}
        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Dapur Rasa &bull; Portal Pengelolaan Resmi
        </p>
      </div>
    </div>
  );
}

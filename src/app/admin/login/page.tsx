"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 60;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Brute-force protection state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Restore lockout and failed attempts count from localStorage on mount
  useEffect(() => {
    try {
      const storedCount = parseInt(
        localStorage.getItem("dr_admin_failed_attempts") || "0",
        10
      );
      const storedLockout = parseInt(
        localStorage.getItem("dr_admin_lockout_until") || "0",
        10
      );
      const now = Date.now();

      if (storedLockout > now) {
        const remaining = Math.ceil((storedLockout - now) / 1000);
        setLockoutRemaining(remaining);
        setFailedAttempts(storedCount || MAX_FAILED_ATTEMPTS);
      } else {
        localStorage.removeItem("dr_admin_lockout_until");
        setFailedAttempts(Number.isFinite(storedCount) ? storedCount : 0);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Countdown timer for lockout cooldown
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          try {
            localStorage.removeItem("dr_admin_lockout_until");
            localStorage.setItem("dr_admin_failed_attempts", "0");
          } catch {}
          setFailedAttempts(0);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Jika sudah memiliki sesi Supabase aktif, langsung alihkan ke dashboard admin
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session) {
        document.cookie = `dr_admin_session=${session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = "/admin";
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Cek apakah form sedang dalam masa lockout cooldown
    if (lockoutRemaining > 0) {
      setErrorMessage(
        `Terlalu banyak percobaan gagal. Akses login terkunci sementara selama ${lockoutRemaining} detik.`
      );
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Silakan isi email dan kata sandi admin.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      // Login berhasil: bersihkan catatan percobaan gagal
      try {
        localStorage.removeItem("dr_admin_failed_attempts");
        localStorage.removeItem("dr_admin_lockout_until");
      } catch {}
      setFailedAttempts(0);
      setLockoutRemaining(0);

      if (data.session) {
        // Simpan token sesi ke cookie agar middleware server Next.js mengizinkan akses ke rute /admin
        document.cookie = `dr_admin_session=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
      }

      // Alihkan langsung ke dashboard admin
      window.location.href = "/admin";
    } catch (err: any) {
      const rawErrorMsg = err?.message || "";
      const isRateLimited =
        rawErrorMsg.toLowerCase().includes("rate limit") ||
        rawErrorMsg.toLowerCase().includes("too_many_requests") ||
        rawErrorMsg.toLowerCase().includes("too many requests") ||
        err?.status === 429;

      let displayMsg = rawErrorMsg;

      if (isRateLimited) {
        // Notifikasi error khusus jika Supabase mengembalikan status rate limit (too_many_requests)
        displayMsg =
          "Terlalu banyak permintaan ke server Supabase (Rate Limit / Too Many Requests). Demi keamanan, akses dikunci sementara selama 60 detik.";
        const lockUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
        try {
          localStorage.setItem("dr_admin_lockout_until", String(lockUntil));
          localStorage.setItem("dr_admin_failed_attempts", String(MAX_FAILED_ATTEMPTS));
        } catch {}
        setFailedAttempts(MAX_FAILED_ATTEMPTS);
        setLockoutRemaining(LOCKOUT_DURATION_SECONDS);
      } else {
        // Catat percobaan login gagal berturut-turut
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          localStorage.setItem("dr_admin_failed_attempts", String(nextAttempts));
        } catch {}

        if (rawErrorMsg.includes("Invalid login credentials")) {
          displayMsg = "Email atau kata sandi salah. Silakan periksa kembali.";
        } else if (rawErrorMsg.includes("Email not confirmed")) {
          displayMsg = "Email belum dikonfirmasi di Supabase.";
        } else if (!displayMsg) {
          displayMsg = "Terjadi kendala saat login. Silakan coba kembali.";
        }

        // Kunci sementara jika gagal 5 kali berturut-turut
        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          displayMsg =
            "Terlalu banyak percobaan login gagal (5 kali). Demi keamanan, tombol login dikunci sementara selama 60 detik.";
          const lockUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
          try {
            localStorage.setItem("dr_admin_lockout_until", String(lockUntil));
          } catch {}
          setLockoutRemaining(LOCKOUT_DURATION_SECONDS);
        } else {
          displayMsg = `${displayMsg} (Percobaan gagal: ${nextAttempts} dari ${MAX_FAILED_ATTEMPTS})`;
        }
      }

      // Bersihkan state form kata sandi secara menyeluruh jika login gagal
      setPassword("");
      setErrorMessage(displayMsg);
      setIsLoading(false);
    }
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-slate-50 to-stone-100/60 flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
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
              Silakan login dengan akun Supabase Admin untuk mengelola katalog menu, harga, dan pesanan pelanggan.
            </p>
          </div>

          {/* Cooldown Lockout Warning Banner */}
          {isLockedOut && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs space-y-1 animate-bounce-short">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Proteksi Keamanan Aktif (Cooldown)</span>
              </div>
              <p className="leading-relaxed">
                Terlalu banyak percobaan login gagal. Demi menjaga keamanan akun admin, silakan tunggu{" "}
                <strong className="font-extrabold text-amber-950 underline">{lockoutRemaining} detik</strong> sebelum mencoba kembali.
              </p>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && !isLockedOut && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={isLockedOut || isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dapurrasa.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#4A0E4E] focus:ring-4 focus:ring-[#4A0E4E]/10 transition-all placeholder:text-slate-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLockedOut || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#4A0E4E] focus:ring-4 focus:ring-[#4A0E4E]/10 transition-all placeholder:text-slate-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isLockedOut || isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Indicator of failed attempts warning */}
            {failedAttempts > 0 && !isLockedOut && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Sisa kesempatan mencoba: {MAX_FAILED_ATTEMPTS - failedAttempts} kali lagi sebelum dikunci.
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className={`w-full py-3 sm:py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                  isLockedOut
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : isLoading
                    ? "bg-slate-400 cursor-not-allowed opacity-90 shadow-none"
                    : "bg-[#4A0E4E] hover:bg-[#3D0840] shadow-[#4A0E4E]/20 hover:shadow-lg active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                    <span>Memverifikasi Akun Supabase...</span>
                  </>
                ) : isLockedOut ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-200" />
                    <span>Terkunci Sementara ({lockoutRemaining}d)</span>
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
              <span>Supabase Auth &bull; Terenkripsi</span>
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

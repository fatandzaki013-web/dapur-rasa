"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { UtensilsCrossed, Clock, MapPin, PhoneCall, ChevronRight, ShieldCheck } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon } from "@/components/SocialIcons";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [currentYear, setCurrentYear] = useState(2026);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Hide footer inside admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const whatsappNum = (settings?.whatsappNumber || "6281234567890").replace(/[^0-9]/g, "");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 4000);
      setSubscribeEmail("");
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-16 pb-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Kolom 1: Brand & Bio */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md">
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-[#4A0E4E] flex items-center justify-center text-white font-bold text-base">
                  <UtensilsCrossed className="w-5 h-5 text-amber-200" />
                </div>
              )}
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              {brandName}
            </span>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            Toko online kue rumahan &amp; camilan premium berkualitas. Menyajikan aneka pastel renyah, risol mayo lumer, kue basah, brownies, dan paket snack box higienis untuk keluarga dan acara Anda.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 pt-2">
            <a
              href={settings?.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-gray-400 transition-all shadow-sm"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.facebookUrl || "https://facebook.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-gray-400 transition-all shadow-sm"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.tiktokUrl || "https://tiktok.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-gray-400 transition-all shadow-sm"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-gray-400 transition-all shadow-sm"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
            </a>
          </div>
        </div>

        {/* Kolom 2: Informasi Toko */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wide uppercase">
            Informasi Toko
          </h4>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#4B95FF] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-300">Jam Operasional</p>
                <p>{settings?.operationalHours || "Setiap Hari: 08:00 - 20:00 WIB"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#4B95FF] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-300">Lokasi Outlet / Dapur</p>
                <p>{settings?.address || "Jl. Mawar Melati No. 12, Kebayoran Baru, Jakarta Selatan"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 3: Layanan Pelanggan */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wide uppercase">
            Layanan Pelanggan
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Punya pertanyaan atau ingin memesan kue dalam jumlah besar untuk snack box acara? Hubungi admin toko kami.
          </p>
          <div className="pt-2 space-y-2">
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>WhatsApp Admin</span>
            </a>
            <p className="text-xs text-gray-400">
              Hubungi: <span className="font-semibold text-gray-300">+{whatsappNum}</span>
            </p>
          </div>
        </div>

        {/* Kolom 4: Newsletter Promo */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wide uppercase">
            Dapatkan Promo Terbaru!
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Subscribe email Anda untuk dapatkan info promo &amp; diskon kue lezat setiap minggu.
          </p>
          <form onSubmit={handleSubscribe} className="relative max-w-sm">
            <input
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              required
              className="w-full h-10 pl-4 pr-12 rounded-full bg-gray-800/80 border border-gray-700/80 focus:outline-none focus:border-[#4B95FF] text-xs text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 w-8 h-8 rounded-full bg-[#4A0E4E] hover:bg-[#5C1261] text-white flex items-center justify-center transition shadow-md cursor-pointer"
              aria-label="Subscribe"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          {isSubscribed && (
            <p className="text-xs text-emerald-400 font-medium animate-fadeIn">
              Terima kasih! Email Anda telah terdaftar.
            </p>
          )}

          {/* Quick Admin Access Link in footer */}
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal Dashboard Admin Toko</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 border-t border-gray-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>
          &copy; {currentYear} {brandName}. Hak Cipta Dilindungi.
        </p>
        <div className="flex gap-4">
          <Link className="hover:text-white transition-colors" href="/kebijakan">
            Privasi
          </Link>
          <Link className="hover:text-white transition-colors" href="/kebijakan">
            Syarat &amp; Ketentuan
          </Link>
          <Link className="hover:text-white transition-colors" href="/kebijakan">
            Kebijakan Pengembalian
          </Link>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  PhoneCall,
  ChevronRight,
  ShieldCheck,
  Truck,
  Heart,
  Wallet,
  Sparkles,
  Award,
} from "lucide-react";
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
  const address = settings?.address || "Perumahan Griya Cileungsi 5, Cileungsi, Jawa Barat";
  const whatsappNum = (settings?.whatsappNumber || "085888159765").replace(/[^0-9]/g, "");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 4000);
      setSubscribeEmail("");
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-14 pb-8 mt-auto">
      {/* Top Value Badges Bar */}
      <div className="mx-auto max-w-7xl px-4 pb-10 border-b border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center shrink-0 border border-purple-800/40">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">100% Halal &amp; Higienis</h4>
              <p className="text-[10.5px] text-slate-400">Dibuat dari bahan segar berkualitas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">Free Ongkir Griya Cileungsi 5</h4>
              <p className="text-[10.5px] text-slate-400">Diantar hangat langsung ke rumah</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800/40">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">Fresh Tiap Hari</h4>
              <p className="text-[10.5px] text-slate-400">Resep autentik rumahan autentik</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/40">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">Bisa Bayar COD</h4>
              <p className="text-[10.5px] text-slate-400">Tunai saat terima kue di rumah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-12 gap-8 py-12">
        {/* Kolom 1: Brand & Socials (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
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
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block">
                {brandName}
              </span>
              <span className="text-[9.5px] text-amber-400 uppercase tracking-widest font-bold">
                Kue Rumahan &amp; Frozen Food
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Dapur spesialis aneka pastel crispy, risol mayo lumer, kue basah tradisional, brownies panggang fudgy, dan pesanan snack box higienis untuk arisan, rapat, dan momen istimewa keluarga.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href={settings?.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-xs"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.facebookUrl || "https://facebook.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-xs"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={settings?.tiktokUrl || "https://tiktok.com"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:bg-[#4A0E4E] hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-xs"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-4 h-4 fill-current" />
            </a>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-xs"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
            </a>
          </div>
        </div>

        {/* Kolom 2: Navigasi Menu & Info (3 cols) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-2">
            Pilihan Menu &amp; Layanan
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/produk" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Katalog Lengkap Kue</span>
              </Link>
            </li>
            <li>
              <Link href="/produk?category=pastel" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Pastel Crispy Berlapis</span>
              </Link>
            </li>
            <li>
              <Link href="/produk?category=risol" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Risol Mayo Smoked Beef &amp; Keju</span>
              </Link>
            </li>
            <li>
              <Link href="/produk?category=frozen-food" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Frozen Food Siap Goreng</span>
              </Link>
            </li>
            <li>
              <Link href="/testimoni" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Ulasan &amp; Testimoni Pelanggan</span>
              </Link>
            </li>
            <li>
              <Link href="/galeri" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span>Galeri Foto Koleksi Kue</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Lokasi & Jam Operasional (3 cols) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-2">
            Dapur &amp; Pengantaran
          </h4>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Alamat Dapur Toko</p>
                <p className="leading-relaxed text-[11.5px]">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Area Pengantaran</p>
                <p className="leading-relaxed text-[11.5px]">
                  <strong>Gratis Ongkir</strong> area Perum Griya Cileungsi 5 &amp; sekitarnya via kurir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Jam Operasional</p>
                <p className="leading-relaxed text-[11.5px]">
                  {settings?.operationalHours || "Setiap Hari: 08:00 - 20:00 WIB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 4: Pesan Cepat WhatsApp & Admin (2 cols) */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-2">
            Pemesanan Langsung
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ingin memesan partai besar atau konsultasi paket snack box? Chat langsung ke WhatsApp admin kami.
          </p>

          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent("Halo Dapur Rasa, saya ingin konsultasi pesanan kue...")}`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Chat WhatsApp</span>
          </a>

          {/* Quick Admin Access Link */}
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-amber-400 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Portal Dashboard Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Policy */}
      <div className="mx-auto max-w-7xl px-4 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
        <p>
          &copy; {currentYear} <strong>{brandName}</strong>. Seluruh Hak Cipta Dilindungi.
        </p>
        <div className="flex gap-4">
          <Link className="hover:text-slate-300 transition-colors" href="/kebijakan">
            Kebijakan Privasi
          </Link>
          <Link className="hover:text-slate-300 transition-colors" href="/kebijakan">
            Syarat &amp; Ketentuan
          </Link>
          <Link className="hover:text-slate-300 transition-colors" href="/testimoni">
            Testimoni
          </Link>
          <Link className="hover:text-slate-300 transition-colors" href="/kontak">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </footer>
  );
}

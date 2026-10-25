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
  Sparkles,
  Wallet,
} from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon } from "@/components/SocialIcons";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [currentYear, setCurrentYear] = useState(2026);

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

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-8 sm:pt-14 pb-8 mt-auto w-full max-w-full overflow-hidden">
      {/* Top Value Badges Bar (Kompak & Rapi di Mobile 2x2, Desktop 4 Kolom) */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pb-6 sm:pb-10 border-b border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {/* Badge 1 */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center shrink-0 border border-purple-800/40">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">100% Halal &amp; Higienis</h4>
              <p className="text-[9px] sm:text-[10.5px] text-slate-400 truncate">Bahan segar bermutu</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white leading-tight">Free Ongkir Griya Cileungsi 5</h4>
              <p className="text-[9px] sm:text-[10.5px] text-slate-400 leading-tight">Diantar hangat ke rumah</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800/40">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">Fresh Tiap Hari</h4>
              <p className="text-[9px] sm:text-[10.5px] text-slate-400 truncate">Resep rumahan lezat</p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/40">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">Bisa Bayar COD</h4>
              <p className="text-[9px] sm:text-[10.5px] text-slate-400 truncate">Bayar tunai di tempat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Responsive Footer */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Kolom 1: Brand & Socials (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0">
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
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight block leading-tight">
                  {brandName}
                </span>
                <span className="text-[9.5px] text-amber-400 uppercase tracking-widest font-bold block">
                  Kue Rumahan &amp; Frozen Food
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dapur spesialis aneka pastel crispy, risol mayo lumer, kue basah, brownies panggang, dan pesanan snack box higienis untuk keluarga &amp; acara Anda.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-0.5">
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

          {/* Kolom 2: Navigasi Menu & Info (md:col-span-4, 2 sub-kolom di mobile) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
                Pilihan Menu
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <Link href="/produk" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Semua Kue</span>
                  </Link>
                </li>
                <li>
                  <Link href="/produk?category=pastel" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Pastel Crispy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/produk?category=risol" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Risol Mayo</span>
                  </Link>
                </li>
                <li>
                  <Link href="/produk?category=frozen-food" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Frozen Food</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
                Informasi
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <Link href="/testimoni" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Testimoni</span>
                  </Link>
                </li>
                <li>
                  <Link href="/galeri" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Galeri Foto</span>
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Kontak Kami</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Admin Portal</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3: Dapur & Chat WhatsApp (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
              Lokasi &amp; Pemesanan
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Alamat Dapur</p>
                  <p className="leading-snug text-[11px] text-slate-400">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Jam Operasional</p>
                  <p className="leading-snug text-[11px] text-slate-400">
                    {settings?.operationalHours || "Setiap Hari: 08:00 - 20:00 WIB"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent("Halo Dapur Rasa, saya ingin pesan kue...")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Chat Pesan Langsung ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Policy (Tanpa Overflow Horizontal) */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 border-t border-slate-900 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2.5 text-center sm:text-left">
        <p>
          &copy; {currentYear} <strong>{brandName}</strong>. Seluruh Hak Cipta Dilindungi.
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10.5px]">
          <Link className="hover:text-slate-300 transition-colors" href="/kebijakan">
            Kebijakan Privasi
          </Link>
          <Link className="hover:text-slate-300 transition-colors" href="/kebijakan">
            Syarat Ketentuan
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

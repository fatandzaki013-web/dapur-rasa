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
  Flame,
  Wallet,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/SocialIcons";
import {
  getWhatsAppNumber,
  getWhatsAppDisplayNumber,
  buildWhatsAppLink,
} from "@/lib/whatsapp";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Sembunyikan footer saat berada di halaman admin
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const address = settings?.address || "Perumahan Griya Cileungsi 5 Blok A8 No. 01, Cileungsi, Bogor, Jawa Barat";
  const waLinkNum = getWhatsAppNumber(settings?.whatsappNumber);
  const waDisplayNum = getWhatsAppDisplayNumber(settings?.whatsappNumber);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-8 sm:pt-14 pb-24 sm:pb-8 mt-auto w-full max-w-full overflow-hidden font-sans">
      {/* ============================================================== */}
      {/* 1. TOP VALUE BADGES (Kompak & Rapi 2x2 di HP, 4 Kolom di PC)    */}
      {/* ============================================================== */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pb-6 sm:pb-10 border-b border-slate-800/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Badge 1: 100% Halal */}
          <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">100% Halal &amp; Higienis</h4>
              <p className="text-[9.5px] sm:text-[11px] text-slate-400 truncate">Bahan alami bermutu</p>
            </div>
          </div>

          {/* Badge 2: Pengantaran Griya Cileungsi 5 */}
          <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-950/70 text-purple-400 flex items-center justify-center shrink-0 border border-purple-800/50">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">Antar Griya Cileungsi 5</h4>
              <p className="text-[9.5px] sm:text-[11px] text-slate-400 truncate">Diantar atau ambil di dapur</p>
            </div>
          </div>

          {/* Badge 3: Fresh Setiap Hari (Logo Flame Baru) */}
          <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-950/70 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800/50">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">Fresh Setiap Hari</h4>
              <p className="text-[9.5px] sm:text-[11px] text-slate-400 truncate">Hangat baru matang</p>
            </div>
          </div>

          {/* Badge 4: Pembayaran Fleksibel */}
          <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800/80 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-950/70 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/50">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">COD, QRIS &amp; Transfer</h4>
              <p className="text-[9.5px] sm:text-[11px] text-slate-400 truncate">Bisa bayar di tempat</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN FOOTER CONTENT (3 Kolom Seimbang di PC, Stack Rapi di HP) */}
      {/* ============================================================== */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Kolom 1: Profil Toko & Sosial Media (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0">
                {settings?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt={brandName}
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
              Spesialis pastel crispy renyah, risol mayo lumer, aneka kue basah tradisional, brownies panggang, dan paket snack box higienis untuk keluarga &amp; acara Anda.
            </p>

            {/* Tombol WhatsApp Resmi Toko */}
            <div className="pt-1">
              <a
                href={buildWhatsAppLink(
                  "Halo Dapur Rasa, saya ingin bertanya tentang pesanan kue...",
                  settings?.whatsappNumber
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-all shadow-xs text-xs font-semibold"
                aria-label="WhatsApp Resmi"
                title="WhatsApp Resmi Toko"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-400" />
                <span>Chat WhatsApp Toko</span>
              </a>
            </div>
          </div>

          {/* Kolom 2: Navigasi Menu & Informasi (md:col-span-4, 2 sub-kolom di mobile) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
                Koleksi Menu
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
                    <span className="truncate">Risol Mayo Lumer</span>
                  </Link>
                </li>
                <li>
                  <Link href="/produk?category=frozen-food" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Frozen Food</span>
                  </Link>
                </li>
                <li>
                  <Link href="/produk?category=snack-box" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Paket Snack Box</span>
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
                  <Link href="/#faq" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Tanya Jawab (FAQ)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/galeri" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Galeri Foto Kue</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tentang-kami" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Tentang Kami</span>
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Kontak Dapur</span>
                  </Link>
                </li>
                <li>
                  <Link href="/artikel" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">Artikel Kuliner</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3: Dapur & Chat WhatsApp (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
              Lokasi Dapur &amp; Pemesanan
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Alamat Dapur</p>
                  <p className="leading-snug text-[11px] text-slate-400 mt-0.5">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Jam Operasional Toko</p>
                  <p className="leading-snug text-[11px] text-slate-400 mt-0.5">
                    <span className="block font-medium text-slate-300">Senin – Sabtu: 05.00 – 22.00 WIB</span>
                    <span className="block text-amber-400 font-semibold">Hari Minggu: Tutup</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-slate-300 font-mono font-bold">
                  {waDisplayNum}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={buildWhatsAppLink(
                  "Halo Dapur Rasa, saya ingin pesan kue...",
                  settings?.whatsappNumber
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Pesan Cepat via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM BAR (Copyright & Kebijakan Rapi Tanpa Overflow)       */}
      {/* ============================================================== */}
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
          <Link className="hover:text-slate-300 transition-colors" href="/#faq">
            FAQ
          </Link>
          <Link className="hover:text-slate-300 transition-colors" href="/kontak">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </footer>
  );
}

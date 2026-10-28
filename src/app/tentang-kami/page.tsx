"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Clock,
  ArrowRight,
  UtensilsCrossed,
  MapPin,
  Phone,
  PackageCheck,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  const { settings, sections } = useStore();
  const aboutSec = sections.find((s) => s.sectionKey === "about");
  const brandName = settings?.brandName || "Dapur Rasa";
  const address = settings?.address || "Perum Griya Cileungsi 5, Cileungsi, Bogor, Jawa Barat";
  const rawWa = (settings?.whatsappNumber || "085888159765").replace(/[^0-9]/g, "");
  const waLinkNum = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : (rawWa.startsWith("62") ? rawWa : "6285888159765");
  const waDisplayNum = rawWa.startsWith("62") ? "0" + rawWa.slice(2) : (rawWa.startsWith("0") ? rawWa : "085888159765");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 sm:pb-16 space-y-16">
      {/* Hero Section Tentang Kami */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A0E4E]/10 text-[#4A0E4E] text-xs font-bold uppercase tracking-wider">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Mengenal Dapur Kami
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-heading tracking-tight leading-tight">
          {aboutSec?.title || `Cerita Kehangatan di Balik ${brandName}`}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          {aboutSec?.subtitle ||
            "Usaha kue rumahan autentik berpusat di Perum Griya Cileungsi 5. Kami menyajikan kelezatan pastel crispy, risol mayo lumer, kue tradisional, dan paket snack box yang dibuat fresh setiap hari."}
        </p>
      </div>

      {/* Main Story & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-6 rounded-3xl overflow-hidden aspect-4/3 bg-stone-100 shadow-xl border-4 border-white relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              aboutSec?.imageUrl ||
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80"
            }
            alt={brandName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
            <div className="text-white space-y-1">
              <span className="text-xs font-semibold bg-[#4A0E4E] px-2.5 py-0.5 rounded-full inline-block">
                Dapur Produksi Rumahan
              </span>
              <p className="text-sm font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{address}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed">
          <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 font-heading leading-snug">
            Dedikasi Rasa Alami, Dibuat Fresh Setiap Pagi Tanpa Pengawet
          </h2>
          <p>
            Di <strong>{brandName}</strong>, kami mendedikasikan dapur rumahan kami di <strong>Perum Griya Cileungsi 5</strong> untuk menghadirkan camilan dan kue berkualitas tinggi. Kami percaya kelezatan sejati lahir dari resep warisan, bumbu rempah alami yang melimpah, dan proses pembuatan yang higienis.
          </p>
          <p>
            Setiap hari, kami mengolah adonan fresh: memilin kulit pastel hingga membentuk lapisan renyah berlapis (*crispy puff*), menggulung risol mayo dengan isian saus creamy berlimpah, serta mengukus kue basah tradisional menggunakan santan murni dan aroma daun pandan asli.
          </p>
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2">
            <h4 className="font-bold text-[#4A0E4E] text-sm flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4" />
              <span>Spesialis Paket Snack Box Acara (&gt; 50 Box)</span>
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kami melayani pemesanan partai besar untuk rapat kantor, syukuran, arisan, pengajian, dan pesta ulang tahun dengan kemasan box premium yang higienis. Untuk opsi pengantaran langsung ke rumah, kami siap melayani pesanan paket box minimal lebih dari 50 box khusus di area <strong>Perum Griya Cileungsi 5</strong> dan sekitarnya.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Lihat Katalog Produk Kue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent(
                "Halo Dapur Rasa, saya ingin konsultasi pemesanan kue / snack box."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Konsultasi WA ({waDisplayNum})</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Pilar Keunggulan Utama */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Nilai Keunggulan Kami
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Komitmen kami untuk memberikan rasa dan pelayanan terbaik kepada setiap pelanggan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1.5">
              100% Cita Rasa Rumahan
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Resep autentik dengan racikan bumbu rempah alami tanpa pemanis buatan berlebih atau pengawet kimia berbahaya.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1.5">
              Higienis & 100% Halal
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dibuat di lingkungan dapur yang bersih dengan pemilihan bahan segar bersertifikasi halal dan aman untuk seluruh keluarga.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1.5">
              Freshly Made Setiap Hari
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tidak ada produk sisa kemarin yang dijual kembali. Seluruh olahan dipanggang atau digoreng baru sesuai jadwal pesanan Anda.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#4A0E4E] flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1.5">
              Area Griya Cileungsi 5
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Melayani ambil sendiri di dapur toko atau pengantaran khusus warga Perum Griya Cileungsi 5 agar kue sampai tepat waktu dan tetap hangat.
            </p>
          </div>
        </div>
      </div>

      {/* Informasi Operasional & Alamat Kontak */}
      <div className="bg-[#4A0E4E] text-white p-6 sm:p-10 rounded-3xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Lokasi Dapur Toko
            </span>
            <p className="font-bold text-base sm:text-lg">{address}</p>
            <p className="text-xs text-purple-200">
              Cileungsi, Kabupaten Bogor, Jawa Barat
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Jam Operasional
            </span>
            <p className="font-bold text-base sm:text-lg">Senin – Sabtu: 05.00 – 22.00 WIB</p>
            <p className="text-xs text-amber-300 font-semibold">
              Hari Minggu: Tutup
            </p>
          </div>

          <div className="space-y-2 flex flex-col justify-center items-center md:items-start">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Kontak & Pemesanan
            </span>
            <a
              href={`https://wa.me/${waLinkNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp: {waDisplayNum}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

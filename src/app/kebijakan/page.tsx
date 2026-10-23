"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ShieldCheck, Clock, RefreshCw, FileText } from "lucide-react";

export default function PoliciesPage() {
  const { settings } = useStore();
  const brandName = settings?.brandName || "Dapur Rasa";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
          Ketentuan Layanan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
          Kebijakan Operasional {brandName}
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mx-auto">
          Panduan transparansi dan standar pelayanan demi kenyamanan dan kepuasan Anda dalam berbelanja aneka kue rumahan kami.
        </p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs">
        {/* Section 1: Pemesanan */}
        <section id="pemesanan" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-3 text-stone-900 font-heading font-bold text-xl border-b border-stone-100 pb-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h2>1. Kebijakan Pemesanan & Jadwal Produksi</h2>
          </div>
          <div className="text-stone-600 text-sm leading-relaxed space-y-2">
            <p>
              • Seluruh pesanan kue dibuat secara segar (freshly baked & made) pada hari pengantaran atau pengambilan.
            </p>
            <p>
              • Untuk pesanan satuan reguler, kami menerima pemesanan maksimal H-1 sebelum pukul 17:00 WIB agar jadwal dapur dapat diatur secara optimal.
            </p>
            <p>
              • Untuk pesanan partai besar (Snack Box di atas 30 box), pemesanan disarankan dilakukan minimal H-2 sebelum acara.
            </p>
            <p>
              • Pesanan dianggap valid setelah dikonfirmasi ketersediaannya oleh tim admin {brandName} melalui WhatsApp resmi.
            </p>
          </div>
        </section>

        {/* Section 2: Pembatalan & Komplain */}
        <section id="pembatalan" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-3 text-stone-900 font-heading font-bold text-xl border-b border-stone-100 pb-2">
            <RefreshCw className="w-5 h-5 text-amber-700" />
            <h2>2. Kebijakan Pembatalan & Pengembalian</h2>
          </div>
          <div className="text-stone-600 text-sm leading-relaxed space-y-2">
            <p>
              • Pembatalan pesanan dapat dilakukan maksimal 24 jam sebelum jadwal pengiriman atau pengambilan yang telah disepakati.
            </p>
            <p>
              • Apabila bahan produksi sudah disiapkan atau kue sudah masuk proses penggorengan/pemanggangan pada hari H, pesanan tidak dapat dibatalkan.
            </p>
            <p>
              • Komplain terkait ketidaksesuaian jumlah atau mutu produk wajib disampaikan maksimal 3 jam setelah pesanan diterima dengan menyertakan foto kemasan dan produk yang jelas.
            </p>
            <p>
              • Kami berkomitmen memberikan solusi terbaik berupa penggantian produk atau pengembalian dana jika terdapat kelalaian dari pihak dapur kami.
            </p>
          </div>
        </section>

        {/* Section 3: Privasi Data */}
        <section id="privasi" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-3 text-stone-900 font-heading font-bold text-xl border-b border-stone-100 pb-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h2>3. Kebijakan Privasi & Data Pelanggan</h2>
          </div>
          <div className="text-stone-600 text-sm leading-relaxed space-y-2">
            <p>
              • Data pelanggan berupa Nama, Nomor WhatsApp, dan Alamat Pengiriman hanya digunakan semata-mata untuk keperluan pemrosesan, konfirmasi, dan pengantaran pesanan kue Anda.
            </p>
            <p>
              • Kami tidak akan pernah menjual, menyebarluaskan, atau membagikan nomor kontak pelanggan kepada pihak ketiga mana pun tanpa persetujuan Anda.
            </p>
          </div>
        </section>

        {/* Section 4: Syarat Pengiriman & Pengambilan */}
        <section id="pengiriman" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-3 text-stone-900 font-heading font-bold text-xl border-b border-stone-100 pb-2">
            <FileText className="w-5 h-5 text-amber-700" />
            <h2>4. Pengiriman & Pengambilan Pesanan</h2>
          </div>
          <div className="text-stone-600 text-sm leading-relaxed space-y-2">
            <p>
              • Pilihan <strong>Ambil Sendiri (Pickup)</strong> bebas biaya ongkir dan dapat diambil langsung di dapur kami sesuai jam operasional yang disepakati.
            </p>
            <p>
              • Pilihan <strong>Pengiriman ke Alamat</strong> dilakukan menggunakan kurir khusus atau layanan kurir instan/sameday dengan tarif ongkir yang telah dikonfirmasi sebelumnya.
            </p>
            <p>
              • Pelanggan bertanggung jawab memastikan ada penerima di alamat tujuan pada estimasi jam pengantaran.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

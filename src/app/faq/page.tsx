"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  Truck,
  ShieldCheck,
  CreditCard,
  Cake,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppApiUrl } from "@/lib/whatsapp";

interface FaqItem {
  q: string;
  a: string;
  category: "ongkir" | "kualitas" | "pembayaran";
}

const FAQ_LIST: FaqItem[] = [
  {
    category: "ongkir",
    q: "Bagaimana jadwal pelayanan dan pemesanan di Dapur Rasa?",
    a: "Dapur Rasa melayani pemesanan aneka kue rumahan dan frozen food secara online setiap hari. Silakan lakukan pemesanan melalui website atau langsung hubungi kami via WhatsApp resmi. Pesanan akan langsung kami siapkan dengan standar higienis dan bahan pilihan.",
  },
  {
    category: "ongkir",
    q: "Bagaimana cara melakukan pemesanan kue di website Dapur Rasa?",
    a: "Sangat mudah! Pilih aneka kue favorit Anda dari katalog produk, tentukan varian atau jumlahnya, lalu klik + Keranjang. Pada halaman Checkout, pilih opsi Ambil Sendiri di Dapur (tanpa perlu repot isi data kontak) atau Diantar ke Rumah. Pesanan Anda akan langsung terhubung ke WhatsApp resmi toko kami untuk konfirmasi ketersediaan.",
  },
  {
    category: "ongkir",
    q: "Apakah ada promo Gratis Ongkir (Free Ongkir) untuk pengantaran?",
    a: "Ya, betul sekali! Kami menyediakan GRATIS ONGKOS KIRIM (Free Ongkir) khusus untuk seluruh pengantaran di area Perumahan Griya Cileungsi 5. Untuk pengantaran ke luar area Griya Cileungsi 5, tarif ongkos kirim disesuaikan secara terjangkau berdasarkan jarak lokasi via kurir atau ojek online.",
  },
  {
    category: "kualitas",
    q: "Apakah seluruh kue dibuat fresh setiap hari dan tanpa bahan pengawet?",
    a: "Tentu! Seluruh olahan pastel, risol mayo, dan aneka kue basah diproduksi fresh secara berkala menggunakan bahan berkualitas pilihan tanpa bahan pengawet kimia berbahaya. 100% Halal, higienis, dan aman dinikmati keluarga tercinta.",
  },
  {
    category: "kualitas",
    q: "Bisa memesan paket Snack Box untuk acara keluarga, arisan, atau rapat kantor?",
    a: "Bisa banget! Kami siap melayani pesanan Snack Box dalam jumlah satuan maupun partai besar untuk arisan, pengajian, syukuran, dan rapat kantor. Anda dapat memilih kombinasi kue asin dan manis sesuai anggaran dan selera acara.",
  },
  {
    category: "kualitas",
    q: "Berapa lama daya tahan kue dan bagaimana cara menyimpan varian Frozen Food?",
    a: "Untuk kue goreng siap santap (pastel dan risol goreng) paling nikmat disantap hangat di hari yang sama. Untuk produk Frozen Food, simpan di dalam freezer lemari es dan dapat bertahan hingga 1-2 bulan dalam keadaan beku tertutup rapat. Cukup keluarkan 10-15 menit di suhu ruang sebelum digoreng dengan minyak panas dan api sedang.",
  },
  {
    category: "pembayaran",
    q: "Metode pembayaran apa saja yang disediakan di Dapur Rasa?",
    a: "Kami menyediakan pembayaran fleksibel dan aman: Bayar Tunai saat Diterima (COD / Cash) saat kurir tiba atau saat ambil di dapur, serta Transfer Rekening resmi dan scan barcode QRIS All Payment (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, Dana, dll).",
  },
];

export default function FaqPage() {
  const { settings } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const brandName = settings?.brandName || "Dapur Rasa";

  const toggleAccordion = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_LIST.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const waHelpUrl = buildWhatsAppApiUrl(
    `Halo ${brandName}, saya ada pertanyaan seputar pemesanan kue dan layanan Dapur Rasa. Boleh minta dibantu?`,
    settings?.whatsappNumber
  );

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] pt-24 sm:pt-28 pb-32 sm:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fadeIn">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#687871] font-medium">
          <Link href="/" className="hover:text-[#111915] transition">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#687871]/50" />
          <span className="text-[#111915] font-bold">Pusat Bantuan &amp; FAQ</span>
        </div>

        {/* Header Seksi */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] text-[#123829] text-xs font-bold border border-[#D5EADF]">
            <HelpCircle className="w-4 h-4 text-[#2E9E6B]" />
            <span>Pusat Informasi &amp; FAQ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111915] font-heading tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>

          <p className="text-xs sm:text-sm text-[#687871] max-w-xl mx-auto leading-relaxed">
            Temukan jawaban lengkap seputar cara pemesanan, gratis ongkir di Griya Cileungsi 5, penyimpanan frozen food, dan pilihan pembayaran.
          </p>
        </div>

        {/* Kotak Pencarian Cepat */}
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#687871]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan... (misal: ongkir, frozen, bayar)"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D5EADF] bg-white text-xs sm:text-sm text-[#111915] placeholder:text-[#687871]/60 focus:outline-none focus:ring-2 focus:ring-[#2E9E6B]/30 focus:border-[#2E9E6B] shadow-2xs transition"
          />
        </div>

        {/* Tab Kategori Filter */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: "all", label: "Semua FAQ", icon: Sparkles },
            { id: "ongkir", label: "Pemesanan & Ongkir", icon: Truck },
            { id: "kualitas", label: "Kualitas & Frozen", icon: Cake },
            { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#123829] text-white shadow-xs"
                    : "bg-[#F4F7F5] text-[#687871] hover:bg-[#E8F5EE] hover:text-[#123829] border border-[#D5EADF]/60"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#E8F5EE]/40 rounded-3xl border border-[#D5EADF] p-6">
              <HelpCircle className="w-10 h-10 text-[#687871] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#111915]">
                Tidak ada pertanyaan yang sesuai dengan kata kunci &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="text-xs font-bold text-[#2E9E6B] hover:underline"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white border-[#47C98E]/50 shadow-card"
                      : "bg-[#F4F7F5]/80 hover:bg-white border-[#D5EADF]/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <span className="font-bold text-xs sm:text-sm text-[#111915] leading-snug">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "rotate-180 bg-[#123829] text-white"
                          : "bg-white text-[#687871] border border-[#D5EADF]"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#687871] leading-relaxed border-t border-[#D5EADF]/50 pt-3 bg-[#E8F5EE]/20 animate-fadeIn">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* WhatsApp Assistance Banner */}
        <div className="bg-gradient-to-br from-[#123829] to-[#1A4D39] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-floating">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#47C98E] text-[11px] font-bold uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5" />
              Bantuan Langsung
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold font-heading">
              Masih Ada Pertanyaan yang Belum Terjawab?
            </h3>
            <p className="text-xs text-white/80 max-w-md">
              Tim dapur kami siap membantu Anda secara ramah melalui WhatsApp untuk pertanyaan pesanan partai besar atau info produk lainnya.
            </p>
          </div>

          <a
            href={waHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#47C98E] hover:bg-[#2E9E6B] text-[#123829] hover:text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
        </div>
      </div>
    </div>
  );
}

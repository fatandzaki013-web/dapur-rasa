"use client";


import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import {
  Flame,
  Snowflake,
  Cake,
  Cookie,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Eye,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Award,
  LayoutGrid,
  PackageCheck,
  ShoppingBag,
  Store,
  Phone,
  LayoutDashboard,
  UtensilsCrossed,
  Image as ImageIcon,
  X,
  ExternalLink,
  Plus,
  ArrowUp,
} from "lucide-react";
import ProductQuickViewModal, { QuickViewProduct } from "@/components/ProductQuickViewModal";
import ProductLikeButton from "@/components/ProductLikeButton";
import { HelpCircle, ChevronDown } from "lucide-react";
import {
  DEFAULT_GALLERY_ITEMS,
  ProductItem,
  GalleryItem,
} from "@/lib/constants";
import { Product, fetchProductsFromSupabase } from "@/lib/supabase";
import { buildWhatsAppLink, getWhatsAppDisplayNumber } from "@/lib/whatsapp";

interface HeroSlide {
  id: string | number;
  title: string;
  subtitle: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  desktopImg: string;
  mobileImg: string;
}

export default function HomePage() {
  const { formatPrice, sections, settings } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 5 Default Hero Slider Banners (Shofi Frozen Style - 16:9 on Desktop, 1:1 on Mobile)
  const defaultHeroSlides = [
    {
      id: 1,
      title: "Pastel Crispy & Risol Mayo Lumer",
      subtitle: "Kerenyahan Kulit Berlapis dengan Isian Daging & Keju Melimpah",
      badge: "Kue Terlaris #1",
      buttonText: "Belanja Sekarang",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 2,
      title: "Brownies Panggang Fudgy Cokelat Belgia",
      subtitle: "Tekstur Shiny Crust Lembut & Cokelat Asli yang Meleleh di Lidah",
      badge: "Varian Baru",
      buttonText: "Lihat Produk",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 3,
      title: "Sosis Solo Gurih & Aneka Kue Basah",
      subtitle: "Resep Warisan Nusantara, Dibuat Fresh Setiap Hari",
      badge: "Khas Tradisional",
      buttonText: "Pesan Sekarang",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 4,
      title: "Paket Snack Box Acara & Rapat Kantor",
      subtitle: "Pilihan Kue Lengkap, Kemasan Elegan, Higienis & Tepat Waktu",
      badge: "Paket Spesial",
      buttonText: "Konsultasi Snack Box",
      buttonLink: "/produk",
      desktopImg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=85",
    },
    {
      id: 5,
      title: "Frozen Food Siap Goreng Kapan Saja",
      subtitle: "Pastel & Risol Beku Praktis untuk Stok Camilan Nikmat di Rumah",
      badge: "Frozen Food",
      buttonText: "Lihat Frozen Food",
      buttonLink: "/produk?category=frozen-food",
      desktopImg: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&auto=format&fit=crop&q=85",
      mobileImg: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=85",
    },
  ];

  // Dynamic hero slides from admin homepage configuration (with fallback)
  const heroSection = sections.find((s) => s.sectionKey === "hero");
  const heroSlides: HeroSlide[] = React.useMemo(() => {
    if (heroSection?.customConfig) {
      try {
        const parsed = JSON.parse(heroSection.customConfig);
        if (Array.isArray(parsed.customBanners) && parsed.customBanners.length > 0) {
          return parsed.customBanners as HeroSlide[];
        }
      } catch (e) {}
    }
    return defaultHeroSlides;
  }, [heroSection?.customConfig]);

  // Bar Filter Kategori 5 Kolom (Semua + 4 Kategori Utama)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryCapsules = [
    {
      name: "Semua",
      slug: "all",
      icon: LayoutGrid,
      desc: "Semua Menu",
    },
    {
      name: "Nasi",
      slug: "nasi",
      icon: UtensilsCrossed,
      desc: "Nasi Box",
    },
    {
      name: "Kue",
      slug: "kue",
      icon: Cake,
      desc: "Kue Basah",
    },
    {
      name: "Frozen",
      slug: "frozen-food",
      icon: Snowflake,
      desc: "Frozen Food",
    },
    {
      name: "Snack Box",
      slug: "snack-box",
      icon: PackageCheck,
      desc: "Snack Box",
    },
  ];

  // Fetch all products from Supabase & gallery items
  useEffect(() => {
    setIsLoadingProducts(true);
    fetchProductsFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch((e) => console.error("Error fetching products from Supabase:", e))
      .finally(() => setIsLoadingProducts(false));

    fetch("/api/public/gallery", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) setGalleryItems(data.items);
      })
      .catch((e) => console.error("Error fetching gallery:", e));
  }, []);

  const handlePrevLightbox = () => {
    if (lightboxIndex === null || galleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null || galleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % galleryItems.length);
  };

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto slide effect (Bisa geser otomatis setiap 4.5 detik)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, heroSlides.length]);

  // Handler geser manual via sentuhan jari (Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    setIsHovered(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swipe kiri -> slide berikutnya
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe kanan -> slide sebelumnya
      setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (product: Product | ProductItem | any) => {
    const res = addItem(product, null, 1);
    showToast(res.message);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  // Filter produk Top Picks sesuai kapsul kategori aktif (Presisi & Bebas Bug)
  const topPickProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => {
      const pCat = (typeof p.category === "string" ? p.category : (p.category as any)?.slug || (p.category as any)?.name || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      if (selectedCategory === "nasi") {
        return pCat.includes("nasi") || pName.includes("nasi") || pName.includes("tumpeng");
      }
      if (selectedCategory === "kue") {
        return (
          pCat.includes("kue") ||
          pCat.includes("pastel") ||
          pCat.includes("risol") ||
          pCat.includes("sosis") ||
          pCat.includes("brownies") ||
          pCat.includes("bolu") ||
          pCat.includes("roti") ||
          pCat.includes("pie") ||
          pName.includes("pastel") ||
          pName.includes("risol") ||
          pName.includes("sosis") ||
          pName.includes("kue") ||
          pName.includes("brownies") ||
          pName.includes("bolu")
        );
      }
      if (selectedCategory === "frozen-food") {
        return pCat.includes("frozen") || pName.includes("frozen") || pName.includes("beku") || pName.includes("siap goreng");
      }
      if (selectedCategory === "snack-box") {
        return pCat.includes("snack") || pCat.includes("box") || pName.includes("snack") || pName.includes("box") || pName.includes("paket");
      }
      return pCat === selectedCategory;
    });
  }, [products, selectedCategory]);

  return (
    <>
      {/* Toast Notification (Floating Pill) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123829] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#47C98E] animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#47C98E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddedToCart={(msg) => showToast(msg)}
      />


      {/* MAIN CONTAINER (Clean padding for desktop header & mobile dock clearance) */}
      <main className="flex-1 pt-[72px] sm:pt-24 md:pt-36 pb-32 md:pb-20 space-y-8 sm:space-y-12 bg-theme-bg transition-colors duration-300" style={{ backgroundColor: "var(--color-bg)" }}>
        {/* ============================================================== */}
        {/* SECTION 1: HERO SHOWCASE (RESPONSIF: SLIDER MOBILE & DUAL DESKTOP) */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            {/* Kolom Kiri / Utama: Hero Slider (8 Kolom di Desktop, Full di HP) */}
            <div className="lg:col-span-8 flex flex-col">
              <div
                className="relative w-full h-full overflow-hidden rounded-[26px] sm:rounded-[34px] shadow-[0_12px_32px_-8px_rgba(18,56,41,0.22)] border border-[#D5EADF]/60 select-none group min-h-[230px] sm:min-h-[290px] lg:min-h-[410px]"
                style={{ touchAction: "pan-y" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Track Slide: Geser Halus Otomatis & Manual */}
                <div
                  className="flex transition-transform duration-700 ease-out h-full"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className="w-full shrink-0 relative min-h-[230px] sm:min-h-[290px] lg:min-h-[410px] flex items-center overflow-hidden"
                    >
                      {/* Full Background Foto Kue / Produk */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={slide.title || "Dapur Rasa"}
                        src={slide.desktopImg || slide.mobileImg || "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=1600&auto=format&fit=crop&q=85"}
                        className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
                      />

                      {/* Gradient Overlay Gelap Emerald Agar Teks & Tombol Terbaca Sangat Jelas */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#123829]/95 via-[#123829]/75 sm:via-[#123829]/60 to-black/35" />

                      {/* Konten Teks & Tombol Aksi */}
                      <div className="relative z-10 w-full px-5 sm:px-10 lg:px-12 py-6 sm:py-10 max-w-2xl text-white space-y-2 sm:space-y-4">
                        {slide.badge && (
                          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xs">
                            {slide.badge}
                          </span>
                        )}

                        <h1 className="text-lg xs:text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-[1.16] tracking-tight line-clamp-2 drop-shadow-sm">
                          {slide.title}
                        </h1>

                        <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed line-clamp-2 max-w-lg drop-shadow-xs">
                          {slide.subtitle}
                        </p>

                        <div className="pt-2 sm:pt-4 flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                          <Link
                            href={slide.buttonLink || "/produk"}
                            className="inline-flex items-center gap-2 bg-white text-[#111915] rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:bg-[#F2F7F4] transition active:scale-95"
                          >
                            <span>{slide.buttonText || "Lihat Menu Kue"}</span>
                            <ChevronRight className="w-4 h-4 text-[#123829]" />
                          </Link>

                          <a
                            href={buildWhatsAppLink(
                              `Halo Dapur Rasa, saya ingin pesan: *${slide.title}*`,
                              settings?.whatsappNumber
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 transition active:scale-95 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#47C98E]" />
                            <span>Pesan via WA</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol Geser Kiri (Sebelumnya) */}
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-md opacity-80 group-hover:opacity-100"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                {/* Tombol Geser Kanan (Berikutnya) */}
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-md opacity-80 group-hover:opacity-100"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                {/* Indikator Titik Slide: Klik untuk Lompat ke Slide */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSlide(i)}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        activeSlide === i
                          ? "bg-white w-5 h-2 shadow-xs"
                          : "bg-white/45 hover:bg-white/75 w-2 h-2"
                      }`}
                      aria-label={`Ke slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Kolom Kanan: 2 Kartu Fitur Khusus Desktop (Hidden di HP, Tampil Elegan di Layar Komputer) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
              {/* Card Desktop 1: Menu Best Seller Spotlight */}
              <div className="flex-1 bg-[#E8F5EE] border border-[#D5EADF] rounded-[28px] p-5 shadow-xs flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#123829] text-white text-[10px] font-bold uppercase tracking-wider">
                      ★ Favorit Pelanggan
                    </span>
                    <span className="text-xs font-bold text-[#2E9E6B]">Rating 4.9/5</span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#111915] leading-snug">
                    Pastel Renyah &amp; Risol Mayo Lumer
                  </h3>
                  <p className="text-xs text-[#687871] leading-relaxed line-clamp-2">
                    Kulit renyah gurih dengan isian daging ayam, sayuran segar &amp; telur asli.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#D5EADF]/80 mt-2">
                  <div>
                    <span className="text-[10px] text-[#687871] block">Mulai dari</span>
                    <span className="font-extrabold text-base text-[#2E9E6B] font-mono leading-none">
                      Rp 3.000 / pcs
                    </span>
                  </div>
                  <Link
                    href="/produk"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Pesan Sekarang</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card Desktop 2: Jaminan Pengantaran Griya Cileungsi 5 */}
              <div className="flex-1 bg-gradient-to-br from-[#123829] to-[#1A4D39] text-white rounded-[28px] p-5 shadow-md flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#47C98E] text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
                    <MapPin className="w-3 h-3 text-[#47C98E]" />
                    <span>Layanan Spesial</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white leading-snug">
                    Antar Cepat Griya Cileungsi 5
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Pengantaran hangat langsung ke rumah Anda tanpa repot keluar komplek. Free ongkir &amp; bisa bayar COD.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/15 mt-2">
                  <span className="text-xs font-bold text-[#47C98E]">
                    Buka: 07.00 - 21.00 WIB
                  </span>
                  <a
                    href={buildWhatsAppLink(
                      "Halo Dapur Rasa, saya ingin order kue untuk diantar ke Griya Cileungsi 5",
                      settings?.whatsappNumber
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#47C98E] hover:bg-[#3db780] text-[#123829] text-xs font-bold transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: 3 FITUR UNGGULAN (Trust Badges Mobile-Optimized)     */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {/* Fitur 1: Ambil di Toko / Antar Griya Cileungsi 5 */}
            <div className="bg-[#E8F5EE]/70 border border-[#D5EADF] p-2.5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3.5 text-center sm:text-left hover:shadow-card transition-all duration-300">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-[#D5EADF]">
                <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-[#123829]" />
              </div>
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <h3 className="font-bold text-[10.5px] sm:text-base text-[#111915] leading-tight">
                  Ambil / Antar Griya 5
                </h3>
                <p className="text-[11px] sm:text-sm text-[#687871] leading-relaxed hidden sm:block">
                  Pilih kue favorit Anda, ambil langsung di dapur atau diantar khusus area Perum Griya Cileungsi 5.
                </p>
              </div>
            </div>

            {/* Fitur 2: 100% Halal & Higienis */}
            <div className="bg-[#E8F5EE]/70 border border-[#D5EADF] p-2.5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3.5 text-center sm:text-left hover:shadow-card transition-all duration-300">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-[#D5EADF]">
                <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#2E9E6B]" />
              </div>
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <h3 className="font-bold text-[10.5px] sm:text-base text-[#111915] leading-tight">
                  100% Halal &amp; Higienis
                </h3>
                <p className="text-[11px] sm:text-sm text-[#687871] leading-relaxed hidden sm:block">
                  Seluruh olahan kue dibuat higienis dengan bahan segar berkualitas tanpa bahan pengawet berbahaya.
                </p>
              </div>
            </div>

            {/* Fitur 3: Kualitas & Rasa Terbaik */}
            <div className="bg-[#E8F5EE]/70 border border-[#D5EADF] p-2.5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3.5 text-center sm:text-left hover:shadow-card transition-all duration-300">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-[#D5EADF]">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-[#2E9E6B]" />
              </div>
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <h3 className="font-bold text-[10.5px] sm:text-base text-[#111915] leading-tight">
                  Kualitas &amp; Rasa
                </h3>
                <p className="text-[11px] sm:text-sm text-[#687871] leading-relaxed hidden sm:block">
                  Dibuat fresh setiap hari dengan resep autentik rumahan untuk cita rasa istimewa terjangkau.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: BAR FILTER KATEGORI (Kapsul Vertikal & Board Desktop) */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6">
          <div className="py-1 flex items-center justify-between sm:justify-center gap-2 sm:gap-3.5 md:gap-4 overflow-x-auto scrollbar-none">
            {categoryCapsules.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`min-w-[64px] sm:min-w-[80px] md:min-w-[130px] h-[82px] sm:h-[88px] md:h-[94px] rounded-[24px] sm:rounded-[28px] md:rounded-[30px] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 active:scale-95 shrink-0 px-2 sm:px-4 ${
                    isActive
                      ? "bg-[#123829] text-white shadow-[0_10px_24px_-4px_rgba(18,56,41,0.38)] scale-102"
                      : "bg-[#F2F7F4] hover:bg-[#E8F5EE] border border-[#D5EADF] text-[#111915] hover:scale-102 hover:border-[#47C98E]/50"
                  }`}
                  aria-label={`Kategori ${cat.name}`}
                >
                  <IconComponent
                    className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${
                      isActive ? "text-white scale-110" : "text-[#111915] stroke-[1.8]"
                    }`}
                  />
                  <span
                    className={`text-[0.72rem] md:text-xs leading-none ${
                      isActive ? "font-bold text-white tracking-wide" : "font-semibold text-[#687871]"
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span className="hidden md:block text-[10px] text-[#687871] font-normal">
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: SEKSI "TOP PICKS" / KATALOG KARTU PASTEL             */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-[1.08rem] sm:text-2xl font-extrabold text-[#111915] tracking-tight">
                Top Picks
              </h2>
              <p className="text-xs text-[#687871]">
                Paling banyak dicari oleh pelanggan kami
              </p>
            </div>
            <Link
              className="text-[0.8rem] font-bold text-[#2E9E6B] hover:underline flex items-center gap-0.5 shrink-0"
              href="/produk"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Skeleton loading or 2-Column Responsive Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 w-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-[24px] bg-[#E8F5EE] p-3.5 space-y-2.5 animate-pulse h-[220px]"
                />
              ))}
            </div>
          ) : topPickProducts.length === 0 ? (
            <div className="p-8 rounded-[24px] bg-[#E8F5EE] border border-[#D5EADF] text-center space-y-3">
              <Cake className="w-10 h-10 text-[#2E9E6B] mx-auto opacity-75" />
              <h3 className="font-extrabold text-sm sm:text-base text-[#111915]">
                Menu kategori ini belum tersedia
              </h3>
              <p className="text-xs text-[#687871] max-w-sm mx-auto">
                Silakan jelajahi menu lezat lainnya atau hubungi kami langsung via WhatsApp untuk pesanan khusus.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#123829] text-white text-xs font-bold shadow-xs hover:bg-[#1A4D39] transition active:scale-95 cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tampilkan Semua Menu</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full">
              {topPickProducts.map((prod) => {
                const currentPrice = prod.price;
                const isOutOfStock = !prod.is_available && !prod.isAvailable;
                const primaryImage =
                  prod.image_url ||
                  prod.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80";
                const categoryDisplay =
                  typeof prod.category === "string"
                    ? prod.category
                    : (prod.category as any)?.name || "Kue";

                return (
                  <article
                    key={prod.id}
                    className="group relative flex flex-col justify-between bg-[#E8F5EE] rounded-[22px] sm:rounded-[24px] lg:rounded-[28px] p-3 sm:p-3.5 lg:p-4 shadow-2xs hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 cursor-pointer min-w-0"
                  >
                    {/* Wadah Foto Seragam 134px-185px: Berada di atas kartu secara alami */}
                    <div className="relative w-full h-[134px] sm:h-[152px] lg:h-[185px] rounded-[16px] lg:rounded-[18px] overflow-hidden bg-white/70 shrink-0">
                      <Link href={`/produk/${prod.slug}`} prefetch={true} className="w-full h-full block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={prod.name}
                          src={primaryImage}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          loading="lazy"
                        />
                      </Link>

                      {/* Desktop Hover Quick View Overlay (Khusus Desktop) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewProduct(prod as any);
                        }}
                        className="hidden lg:flex absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center cursor-pointer pointer-events-auto"
                      >
                        <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#123829] text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs hover:scale-105 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-[#2E9E6B]" />
                          <span>Lihat Detail</span>
                        </span>
                      </button>

                      {/* Tombol Wishlist Terintegrasi Alami di Pojok Kanan Atas Foto */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <ProductLikeButton product={prod} size="sm" />
                      </div>

                      {/* Status Badge di Pojok Kiri Atas Foto */}
                      {isOutOfStock ? (
                        <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wide pointer-events-none shadow-2xs">
                          Habis
                        </span>
                      ) : prod.isBestSeller ? (
                        <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-[#123829]/80 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-wide pointer-events-none shadow-2xs">
                          Favorit
                        </span>
                      ) : null}
                    </div>

                    {/* Area Informasi Bawah */}
                    <div className="min-w-0 pr-9 lg:pr-0 pt-2.5 lg:pt-3">
                      <span className="text-[0.74rem] lg:text-xs text-[#2E9E6B] font-bold uppercase tracking-wider block">
                        {categoryDisplay}
                      </span>
                      <Link href={`/produk/${prod.slug}`} prefetch={true} className="block mt-0.5">
                        <h3 className="text-[0.92rem] lg:text-base font-extrabold text-[#111915] group-hover:text-[#123829] transition-colors line-clamp-1 leading-snug">
                          {prod.name}
                        </h3>
                      </Link>
                      <div className="text-[1.02rem] lg:text-lg font-extrabold text-[#2E9E6B] font-mono mt-1.5 leading-none">
                        {formatPrice(currentPrice)}
                      </div>
                    </div>

                    {/* Versi Mobile: Tombol Bulat + Sudut Kanan Bawah Kartu 36px x 36px */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickAdd(prod);
                      }}
                      className={`lg:hidden absolute bottom-3.5 right-3.5 w-[36px] h-[36px] rounded-full bg-[#123829] hover:bg-[#1A4D39] text-white inline-flex items-center justify-center active:scale-90 shadow-xs transition-transform cursor-pointer ${
                        isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
                      aria-label={isOutOfStock ? "Stok Habis" : `Tambah ${prod.name} ke Keranjang`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    {/* Versi Desktop: Tombol Pill Lebar di Bawah Informasi */}
                    <div className="hidden lg:block pt-3 mt-1.5 border-t border-[#D5EADF]/60">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAdd(prod);
                        }}
                        className={`w-full py-2 px-3 rounded-full bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 active:scale-95 shadow-xs transition-all cursor-pointer ${
                          isOutOfStock ? "opacity-50 cursor-not-allowed bg-stone-400" : ""
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isOutOfStock ? "Stok Habis" : "+ Keranjang"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: GALERI FOTO KUE & CAMILAN (Semua Foto Bersatu)     */}
        {/* ============================================================== */}
        <section id="galeri-section" className="mx-auto max-w-7xl px-2.5 sm:px-6 space-y-4 sm:space-y-6 pt-4 border-t border-[#D5EADF]/60 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#123829] mb-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#2E9E6B]" />
                <span>Koleksi Visual Toko ({galleryItems.length} Foto Asli)</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#111915] tracking-tight">
                Galeri Foto Kue &amp; Camilan
              </h2>
              <p className="text-xs sm:text-sm text-[#687871]">
                Semua foto asli olahan aneka pastel renyah, risol mayo lumer, kue basah, dan snack box Dapur Rasa
              </p>
            </div>
            <Link
              className="text-xs sm:text-sm font-semibold text-[#123829] hover:text-[#2E9E6B] hover:underline flex items-center gap-0.5 shrink-0 self-start sm:self-auto transition-colors"
              href="/galeri"
            >
              <span>Buka Halaman Galeri</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Semua Foto Galeri (1 Tampilan Utuh Rapi & Bebas Bug) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative flex flex-col overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-[#D5EADF] shadow-2xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Photo with zoom effect */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={item.altText || item.title}
                    src={item.imageUrl}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  {item.categoryTag && (
                    <span className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 rounded-full bg-white/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wide text-[#123829] shadow-xs">
                      {item.categoryTag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/95 text-gray-900 text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                      <Eye className="w-3.5 h-3.5 text-[#2E9E6B]" />
                      <span>Lihat Foto</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#111915] group-hover:text-[#123829] transition-colors line-clamp-1 leading-snug">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-[10px] sm:text-xs text-[#687871] line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: CARA BELANJA MUDAH (2x2 Grid on Mobile)             */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6 py-4 sm:py-6 border-t border-[#D5EADF]/60">
          <div className="text-center space-y-1 sm:space-y-2 mb-6 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#111915] tracking-tight">
              Cara Belanja Mudah
            </h2>
            <p className="text-xs sm:text-sm text-[#687871] max-w-md mx-auto">
              Pesan secara online dan ambil belanjaan langsung di dapur kami atau dikirim via kurir
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D5EADF] p-4 sm:p-8 md:p-10 shadow-xs relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#F2F7F4] border border-[#D5EADF]/80 space-y-2 relative group hover:border-[#47C98E] transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#123829] shadow-2xs group-hover:bg-[#123829] group-hover:text-white transition-all duration-300">
                    <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#123829] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Pilih Produk</h3>
                <p className="text-[10px] sm:text-xs text-[#687871] leading-relaxed px-1">
                  Pilih aneka kue rumahan dan camilan berkualitas dari katalog.
                </p>
              </div>

              {/* Connecting Chevron 1 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[21%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#F2F7F4] border border-[#D5EADF]/80 space-y-2 relative group hover:border-[#2E9E6B] transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#2E9E6B]/10 flex items-center justify-center text-[#2E9E6B] shadow-2xs group-hover:bg-[#2E9E6B] group-hover:text-white transition-all duration-300">
                    <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2E9E6B] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    2
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Keranjang Belanja</h3>
                <p className="text-[10px] sm:text-xs text-[#687871] leading-relaxed px-1">
                  Masukkan pilihan kue Anda ke dalam keranjang belanja.
                </p>
              </div>

              {/* Connecting Chevron 2 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[46%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#F2F7F4] border border-[#D5EADF]/80 space-y-2 relative group hover:border-[#47C98E] transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Phone className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    3
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Kirim WA &amp; Alamat</h3>
                <p className="text-[10px] sm:text-xs text-[#687871] leading-relaxed px-1">
                  Kirim ke WA toko dan sertakan alamat pengantaran atau jam ambil.
                </p>
              </div>

              {/* Connecting Chevron 3 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[71%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#F2F7F4] border border-[#D5EADF]/80 space-y-2 relative group hover:border-[#47C98E] transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#123829]/10 flex items-center justify-center text-[#123829] shadow-2xs group-hover:bg-[#123829] group-hover:text-white transition-all duration-300">
                    <Store className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#123829] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    4
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Ambil / Antar</h3>
                <p className="text-[10px] sm:text-xs text-[#687871] leading-relaxed px-1">
                  Ambil di dapur atau terima kiriman di Griya Cileungsi 5.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: FAQ - PERTANYAAN UMUM (Desktop Only, Mobile via Menu) */}
        {/* ============================================================== */}
        <section id="faq" className="hidden md:block mx-auto max-w-4xl px-2.5 sm:px-6 space-y-6 pt-4 border-t border-[#D5EADF]/60 scroll-mt-24">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5EE] text-[#123829] text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-[#2E9E6B]" />
              <span>Pusat Informasi &amp; Bantuan</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#111915] tracking-tight font-heading">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-[#687871] max-w-lg mx-auto">
              Temukan jawaban cepat seputar pemesanan kue, ketentuan pengantaran gratis ongkir di Griya Cileungsi 5, dan cara penyajian.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Bagaimana jadwal pelayanan dan pemesanan di Dapur Rasa?",
                a: "Dapur Rasa melayani pemesanan aneka kue rumahan dan frozen food secara online via WhatsApp resmi kami. Silakan lakukan pemesanan melalui katalog website atau langsung hubungi kami via WhatsApp."
              },
              {
                q: "Bagaimana cara melakukan pemesanan kue di website Dapur Rasa?",
                a: "Sangat mudah! Pilih aneka kue favorit Anda dari katalog produk, tentukan jumlahnya, lalu klik Tambah ke Keranjang. Pada halaman Checkout, cantumkan nama, nomor WhatsApp, serta pilihan diambil langsung di dapur atau diantar ke rumah. Pesanan Anda akan langsung terhubung ke WhatsApp resmi toko kami untuk konfirmasi ketersediaan."
              },
              {
                q: "Apakah ada promo Gratis Ongkir (Free Ongkir) untuk pengantaran?",
                a: "Ya, betul sekali! Kami menyediakan GRATIS ONGKOS KIRIM (Free Ongkir) khusus untuk seluruh pengantaran di area Perumahan Griya Cileungsi 5. Untuk pengantaran ke luar area Griya Cileungsi 5, tarif ongkos kirim akan disesuaikan secara terjangkau berdasarkan jarak lokasi Anda via kurir/ojek online."
              },
              {
                q: "Apakah seluruh kue dibuat fresh setiap hari dan tanpa bahan pengawet?",
                a: "Tentu! Seluruh olahan pastel, risol mayo, dan aneka kue basah diproduksi fresh setiap hari secara higienis menggunakan bahan berkualitas pilihan tanpa bahan pengawet kimia berbahaya. 100% Halal dan aman dinikmati keluarga tercinta."
              },
              {
                q: "Bisa memesan paket Snack Box untuk acara keluarga, arisan, atau rapat kantor?",
                a: "Bisa banget! Kami siap melayani pesanan Snack Box dalam jumlah satuan maupun partai besar untuk arisan, pengajian, syukuran, dan rapat kantor. Anda dapat memilih kombinasi kue asin dan manis sesuai anggaran."
              },
              {
                q: "Berapa lama daya tahan kue dan bagaimana cara menyimpan varian Frozen Food?",
                a: "Untuk kue goreng siap santap (pastel dan risol goreng) paling nikmat disantap hangat di hari yang sama. Untuk produk Frozen Food, simpan di dalam freezer lemari es dan dapat bertahan hingga 1-2 bulan dalam keadaan beku tertutup rapat. Cukup keluarkan 10-15 menit di suhu ruang sebelum digoreng dengan api sedang."
              },
              {
                q: "Metode pembayaran apa saja yang disediakan?",
                a: "Kami menyediakan pembayaran fleksibel: Bayar Tunai saat Diterima (COD / Cash) saat kurir tiba atau saat ambil di dapur, serta Transfer Bank resmi (BCA, Mandiri, BRI) dan scan barcode QRIS (GoPay, OVO, ShopeePay, Dana)."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "liquid-glass-card border-[#47C98E]/40 shadow-card"
                      : "liquid-glass hover:border-[#2E9E6B]/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-[#E8F5EE]/40 transition cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-[#111915] leading-snug">
                      {faq.q}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-[#E8F5EE] text-[#123829]" : "bg-[#F2F7F4] text-[#687871]"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#687871] leading-relaxed border-t border-[#D5EADF]/60 pt-3 bg-[#E8F5EE]/30 animate-fadeIn">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Homepage Gallery Lightbox Modal */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrevLightbox}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextLightbox}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="max-w-3xl w-full max-h-[85vh] flex flex-col items-center bg-gray-900/90 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="relative w-full max-h-[60vh] flex items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryItems[lightboxIndex].imageUrl}
                alt={galleryItems[lightboxIndex].title}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-4 sm:p-6 text-white w-full space-y-1.5 bg-gray-900">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#123829] text-white">
                  {galleryItems[lightboxIndex].categoryTag || "Koleksi Dapur Rasa"}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {lightboxIndex + 1} / {galleryItems.length}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold">
                {galleryItems[lightboxIndex].title}
              </h3>
              {galleryItems[lightboxIndex].caption && (
                <p className="text-xs sm:text-sm text-gray-300">
                  {galleryItems[lightboxIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Desktop Action Hub (Khusus Tampilan Desktop >= 768px) */}
      <div className="hidden md:flex flex-col gap-2.5 fixed bottom-6 right-6 z-40 items-end">
        {/* Tombol Scroll ke Atas */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#123829] shadow-md border border-[#D5EADF] flex items-center justify-center transition active:scale-90 hover:scale-105 cursor-pointer"
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Tombol Chat WhatsApp Mengambang */}
        <a
          href={buildWhatsAppLink("Halo Dapur Rasa, saya ingin order kue", settings?.whatsappNumber)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold shadow-lg hover:shadow-xl border border-[#47C98E]/40 transition active:scale-95 group cursor-pointer"
          title="Chat WhatsApp Dapur Rasa"
        >
          <Phone className="w-4 h-4 text-[#47C98E] group-hover:scale-110 transition-transform" />
          <span>Chat WhatsApp</span>
        </a>
      </div>
    </>
  );
}

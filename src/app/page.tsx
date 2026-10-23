"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Eye,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  ShoppingBag,
  Store,
  Phone,
  LayoutDashboard,
  UtensilsCrossed,
} from "lucide-react";
import ProductQuickViewModal, { QuickViewProduct } from "@/components/ProductQuickViewModal";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  promoPrice?: number | null;
  unit: string;
  stock: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNew: boolean;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category: { id: string; name: string; slug: string };
  variants: Array<{ id: string; name: string; priceAdjustment: number; stock: number }>;
}

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
  const { formatPrice, sections } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // 10 Kategori Produk (Shofi Frozen Circle Style)
  const categoryCircles = [
    { name: "Pastel", slug: "pastel", emoji: "🥟" },
    { name: "Risol", slug: "risol", emoji: "🌯" },
    { name: "Sosis Solo", slug: "sosis-solo", emoji: "🥖" },
    { name: "Brownies", slug: "brownies-bolu", emoji: "🍫" },
    { name: "Kue Basah", slug: "aneka-kue-basah", emoji: "🍰" },
    { name: "Klepon", slug: "aneka-kue-basah", emoji: "🍡" },
    { name: "Kue Kering", slug: "kue-kering", emoji: "🍪" },
    { name: "Snack Box", slug: "snack-box", emoji: "🍱" },
    { name: "Frozen Food", slug: "frozen-food", emoji: "❄️" },
    { name: "Paket Hemat", slug: "paket-hemat", emoji: "🎁" },
  ];

  // Fetch all products
  useEffect(() => {
    fetch("/api/public/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((e) => console.error("Error fetching products:", e));
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, heroSlides.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (product: ProductItem) => {
    const res = addItem(product, null, 1);
    showToast(res.message);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#4A0E4E] animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddedToCart={(msg) => showToast(msg)}
      />


      {/* MAIN CONTAINER (Matching Shofi Frozen exact -mt-20 pt-4 md:pt-6 pb-12 space-y-12) */}
      <main className="flex-1 -mt-20 pt-4 md:pt-6 pb-12 space-y-12 bg-white">
        {/* ============================================================== */}
        {/* SECTION 1: HERO SLIDER CAROUSEL (Full Width Shofi Frozen Style) */}
        {/* ============================================================== */}
        <section
          className="relative w-full overflow-hidden bg-gray-100"
          style={{ touchAction: "pan-y" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="w-full shrink-0 relative">
                {/* Desktop Aspect Ratio 16:9 */}
                <div className="hidden md:block relative w-full aspect-16/9 overflow-hidden bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={slide.title}
                    src={slide.desktopImg}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark Gradient Overlay for Typography Clarity */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center">
                    <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full">
                      <div className="max-w-xl space-y-4 text-white">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#4A0E4E] text-white text-xs font-extrabold tracking-wide uppercase shadow-sm">
                          {slide.badge}
                        </span>
                        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                          {slide.title}
                        </h1>
                        <p className="text-sm lg:text-base text-gray-200 leading-relaxed">
                          {slide.subtitle}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={slide.buttonLink || "/produk"}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                          >
                            <span>{slide.buttonText || "Belanja Sekarang"}</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Aspect Ratio 1:1 */}
                <div className="block md:hidden relative w-full aspect-square overflow-hidden bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={slide.title}
                    src={slide.mobileImg}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#4A0E4E] text-white text-[10px] font-bold tracking-wide uppercase self-start">
                      {slide.badge}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight leading-snug">
                      {slide.title}
                    </h2>
                    <p className="text-xs text-gray-300 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    <div className="pt-1">
                      <Link
                        href={slide.buttonLink || "/produk"}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4A0E4E] text-white font-bold text-xs shadow-sm"
                      >
                        <span>{slide.buttonText || "Belanja Sekarang"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />

          {/* Prev Navigation Button */}
          <button
            type="button"
            onClick={() =>
              setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-sm cursor-pointer"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>

          {/* Next Navigation Button */}
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-sm cursor-pointer"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === i
                    ? "bg-white w-8 h-2.5 shadow-sm"
                    : "bg-white/50 hover:bg-white/70 w-2.5 h-2.5"
                }`}
                aria-label={`Ke slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: 3 FITUR UNGGULAN (Shofi Frozen Trust Badges Style)  */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fitur 1: Ambil di Toko / Antar Griya Cileungsi 5 */}
            <div className="bg-purple-50/70 border border-purple-100/60 p-6 rounded-2xl shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-purple-100">
                <MapPin className="w-6 h-6 text-[#4A0E4E]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">Ambil Sendiri / Antar Griya Cileungsi 5</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Pilih kue favorit Anda, tentukan mau diambil sendiri di dapur atau diantar langsung ke alamat rumah khusus area Perum Griya Cileungsi 5.
                </p>
              </div>
            </div>

            {/* Fitur 2: 100% Halal & Higienis */}
            <div className="bg-emerald-50/70 border border-emerald-100/60 p-6 rounded-2xl shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-[#15803D]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">100% Halal &amp; Higienis</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Seluruh olahan kue dan camilan dibuat higienis dengan bahan segar berkualitas tanpa bahan pengawet berbahaya.
                </p>
              </div>
            </div>

            {/* Fitur 3: Kualitas & Harga Terbaik */}
            <div className="bg-amber-50/70 border border-amber-100/60 p-6 rounded-2xl shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">Kualitas &amp; Rasa Terbaik</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Dibuat setiap hari secara fresh dengan resep autentik rumahan untuk cita rasa istimewa dengan harga terjangkau.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: KATEGORI PRODUK (Shofi Frozen Circular Style)       */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-4 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Kategori Produk
              </h2>
              <p className="text-sm text-gray-500">
                Pilih kategori kue &amp; camilan favorit Anda
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-[#4A0E4E] hover:underline flex items-center gap-1"
              href="/produk"
            >
              <span>Lihat Semua Kategori</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-3">
            {categoryCircles.map((cat) => (
              <Link
                key={cat.name}
                className="group flex flex-col items-center gap-2"
                href={`/produk?category=${cat.slug}`}
              >
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-3xl group-hover:scale-105 group-hover:border-[#4A0E4E]/30 group-hover:shadow-md transition-all duration-300">
                  {cat.emoji}
                </div>
                <p className="font-bold text-[10px] sm:text-xs text-gray-700 text-center leading-tight line-clamp-2 px-1">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: PRODUK POPULER (Shofi Frozen Product Card Style)    */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-4 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Produk Populer
              </h2>
              <p className="text-sm text-gray-500">
                Paling banyak dicari oleh pelanggan kami
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-[#4A0E4E] hover:underline flex items-center gap-1"
              href="/produk"
            >
              <span>Lihat Selengkapnya</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {products.map((prod) => {
              const currentPrice = prod.price;
              const primaryImage =
                prod.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80";

              return (
                <article
                  key={prod.id}
                  className="group relative flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/10 rounded-3xl"
                >
                  {/* Photo with zoom effect */}
                  <Link
                    className="relative block aspect-square overflow-hidden bg-slate-50"
                    href={`/produk/${prod.slug}`}
                    prefetch={true}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={prod.name}
                      src={primaryImage}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* Badge Overlay */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1.5 p-2.5">
                      <div className="flex flex-col gap-1">
                        {prod.isAvailable ? (
                          <span className="rounded-full bg-emerald-600/90 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase shadow-sm">
                            Tersedia
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-600/90 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase shadow-sm">
                            Tidak Tersedia
                          </span>
                        )}
                        {prod.isBestSeller && (
                          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#4A0E4E] shadow-sm">
                            Best seller
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Body Info */}
                  <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                        {prod.category?.name || "Kue"}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        50 ulasan
                      </span>
                    </div>

                    <Link className="min-h-[42px]" href={`/produk/${prod.slug}`} prefetch={true}>
                      <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 transition group-hover:text-[#4A0E4E] sm:text-[15px]">
                        {prod.name}
                      </h3>
                    </Link>

                    {/* Price and Stock Status */}
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Harga Satuan
                        </p>
                        <p className="text-base font-black text-[#4A0E4E] sm:text-lg">
                          {formatPrice(currentPrice)}
                        </p>
                      </div>

                      {prod.isAvailable ? (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          <PackageCheck className="h-3 w-3" />
                          <span>Tersedia</span>
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                          <span>Tidak Tersedia</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Add to Cart + Quick View */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={!prod.isAvailable}
                        onClick={() => handleQuickAdd(prod)}
                        className={`inline-flex items-center justify-center font-medium transition-colors px-3 py-1.5 text-sm flex-1 h-9 rounded-lg shadow-sm ${
                          !prod.isAvailable
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-[#4A0E4E] text-white hover:bg-[#5C1261] cursor-pointer active:scale-95"
                        }`}
                        title={!prod.isAvailable ? "Produk Tidak Tersedia" : "Tambah ke Keranjang"}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(prod as any)}
                        className="inline-flex items-center justify-center font-medium transition-colors border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm h-9 w-9 p-0 rounded-lg shadow-2xs cursor-pointer active:scale-95"
                        title="Lihat Cepat (Quick View)"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: CARA BELANJA MUDAH (Shofi Frozen 4 Steps Style)     */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-6 border-t border-gray-100">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Cara Belanja Mudah
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Pesan secara online dan ambil belanjaan Anda langsung di outlet kami atau dikirim via kurir
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-3 relative group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#4A0E4E]/10 flex items-center justify-center text-[#4A0E4E] shadow-sm group-hover:bg-[#4A0E4E] group-hover:text-white transition-all duration-300">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#4A0E4E] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    1
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-sm">Pilih Produk</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  Pilih aneka kue rumahan dan camilan berkualitas dari katalog kami.
                </p>
              </div>

              {/* Connecting Chevron 1 */}
              <div className="hidden md:flex items-center justify-center absolute top-5 left-[21%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-3 relative group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#4B95FF]/10 flex items-center justify-center text-[#4B95FF] shadow-sm group-hover:bg-[#4B95FF] group-hover:text-white transition-all duration-300">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#4B95FF] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    2
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-sm">Keranjang Belanja</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  Masukkan pilihan kue Anda ke dalam keranjang belanja digital.
                </p>
              </div>

              {/* Connecting Chevron 2 */}
              <div className="hidden md:flex items-center justify-center absolute top-5 left-[46%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-3 relative group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Phone className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    3
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-sm">Kirim WA &amp; Sertakan Alamat</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  Kirim pesanan ke WA toko dan sertakan alamat pengantaran lengkap Anda atau konfirmasi jam pengambilan di dapur.
                </p>
              </div>

              {/* Connecting Chevron 3 */}
              <div className="hidden md:flex items-center justify-center absolute top-5 left-[71%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-3 relative group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Store className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    4
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-sm">Ambil / Terima di Griya Cileungsi 5</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  Ambil di dapur atau tunggu pengantaran ke rumah Anda di Perum Griya Cileungsi 5.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

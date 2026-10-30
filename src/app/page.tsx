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
  Sparkles,
  PackageCheck,
  ShoppingBag,
  Store,
  Phone,
  LayoutDashboard,
  UtensilsCrossed,
  Image as ImageIcon,
  X,
  ExternalLink,
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

// Category filter chips for product browsing on homepage
const MOBILE_CATEGORIES = [
  { label: "Semua", value: "ALL", emoji: "✨" },
  { label: "Pastel", value: "Pastel", emoji: "🥟" },
  { label: "Risol", value: "Risol", emoji: "🧀" },
  { label: "Sosis Solo", value: "Sosis Solo", emoji: "🌯" },
  { label: "Brownies", value: "Brownies", emoji: "🍫" },
  { label: "Snack Box", value: "Snack Box", emoji: "📦" },
  { label: "Nasi", value: "Nasi", emoji: "🍱" },
];

export default function HomePage() {
  const { formatPrice, sections, settings } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [selectedGalleryTag, setSelectedGalleryTag] = useState<string>("Semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [galleryPage, setGalleryPage] = useState(1);
  const GALLERY_PER_PAGE = 8;

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

  // 4 Kategori Produk Utama (Nasi, Kue, Frozen, Snack Box)
  const categoryCircles = [
    {
      name: "Nasi",
      slug: "nasi",
      icon: UtensilsCrossed,
      desc: "Nasi Box & Tumpeng",
    },
    {
      name: "Kue",
      slug: "kue",
      icon: Cake,
      desc: "Kue Basah & Brownies",
    },
    {
      name: "Frozen",
      slug: "frozen-food",
      icon: Snowflake,
      desc: "Pastel & Risol Beku",
    },
    {
      name: "Snack Box",
      slug: "snack-box",
      icon: PackageCheck,
      desc: "Paket Rapat & Acara",
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

  // Filter products by selected category chip on homepage
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return products;
    return products.filter((prod) => {
      const cat =
        typeof prod.category === "string"
          ? prod.category
          : (prod.category as any)?.name || "";
      return cat.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [products, selectedCategory]);

  // Filter gallery items by selected tag
  const filteredGalleryItems = useMemo(() => {
    if (selectedGalleryTag === "Semua") return galleryItems;
    return galleryItems.filter((item) => item.categoryTag === selectedGalleryTag);
  }, [galleryItems, selectedGalleryTag]);

  // Gallery pagination: 8 foto per halaman (4 di kiri, 4 di kanan pada mobile 2 kolom)
  const totalGalleryPages = Math.max(1, Math.ceil(filteredGalleryItems.length / GALLERY_PER_PAGE));
  const displayedGalleryItems = useMemo(() => {
    const start = (galleryPage - 1) * GALLERY_PER_PAGE;
    return filteredGalleryItems.slice(start, start + GALLERY_PER_PAGE);
  }, [filteredGalleryItems, galleryPage]);

  // Reset halaman ke 1 saat ganti kategori
  const handleGalleryTagChange = (tag: string) => {
    setSelectedGalleryTag(tag);
    setGalleryPage(1);
  };

  // Unique gallery tags
  const galleryTags = useMemo(() => {
    const rawTags = galleryItems.map((i) => i.categoryTag).filter(Boolean) as string[];
    return ["Semua", ...Array.from(new Set(rawTags))];
  }, [galleryItems]);

  const handlePrevLightbox = () => {
    if (lightboxIndex === null || filteredGalleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredGalleryItems.length) % filteredGalleryItems.length);
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null || filteredGalleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredGalleryItems.length);
  };

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

  const handleQuickAdd = (product: Product | ProductItem | any) => {
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


      {/* MAIN CONTAINER (Clean mobile padding so floating navbar never covers the banner) */}
      <main className="flex-1 pt-[68px] sm:pt-24 pb-28 sm:pb-16 space-y-5 sm:space-y-10 bg-theme-bg transition-colors duration-300" style={{ backgroundColor: "var(--color-bg)" }}>
        {/* ============================================================== */}
        {/* SECTION 1: HERO SLIDER CAROUSEL (App-Style Responsive Banner)   */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6">
          <div
            className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-md bg-gray-900"
            style={{ touchAction: "pan-y" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {heroSlides.map((slide) => (
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
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex items-center">
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
                          <div className="pt-2 flex items-center gap-3">
                            <Link
                              href={slide.buttonLink || "/produk"}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                            >
                              <span>{slide.buttonText || "Lihat Menu Kue"}</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                            <a
                              href={buildWhatsAppLink(
                                "Halo Dapur Rasa, saya ingin konsultasi pemesanan kue / snack box",
                                settings?.whatsappNumber
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-xs border border-white/25 transition-all active:scale-95"
                            >
                              <Phone className="w-4 h-4 text-emerald-400" />
                              <span>Pesan via WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Aspect Ratio 16:9 - Sleek, Beautiful, Comfortable on Small Screens */}
                  <div className="block md:hidden relative w-full aspect-[16/9] overflow-hidden bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={slide.title}
                      src={slide.mobileImg}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3 xs:p-4 text-white space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-[#4A0E4E] text-[10px] font-extrabold tracking-wide uppercase self-start shadow-xs">
                        {slide.badge}
                      </span>
                      <h2 className="text-sm xs:text-base font-black tracking-tight leading-snug line-clamp-1 xs:line-clamp-2 drop-shadow-xs">
                        {slide.title}
                      </h2>
                      <p className="text-[11px] text-stone-200 line-clamp-1 font-medium">
                        {slide.subtitle}
                      </p>
                      <div className="pt-0.5 flex items-center gap-2">
                        <Link
                          href={slide.buttonLink || "/produk"}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-xs shadow-xs active:scale-95 transition"
                        >
                          <span>Lihat Menu</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <a
                          href={buildWhatsAppLink(
                            "Halo Dapur Rasa, saya ingin pesan kue",
                            settings?.whatsappNumber
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev Navigation Button */}
            {/* Mobile Slide Counter Badge in top-right (zero collision with buttons) */}
            <div className="md:hidden absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold tracking-wider">
              {activeSlide + 1} / {heroSlides.length}
            </div>

            {/* Prev Navigation Button (Desktop only) */}
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
              }
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-xs cursor-pointer active:scale-90"
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            {/* Next Navigation Button (Desktop only) */}
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-xs cursor-pointer active:scale-90"
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            {/* Dots Indicator (Desktop only) */}
            <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === i
                      ? "bg-white w-6 sm:w-8 h-2 sm:h-2.5 shadow-sm"
                      : "bg-white/50 hover:bg-white/70 w-2 sm:w-2.5 h-2 sm:h-2.5"
                  }`}
                  aria-label={`Ke slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: 3 FITUR UNGGULAN (Trust Badges Mobile & Desktop)    */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6">
          {/* Desktop Layout: 3 Columns Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {/* Fitur 1: Ambil di Toko / Antar Griya Cileungsi 5 */}
            <div className="bg-purple-50/70 border border-purple-100/60 p-6 rounded-2xl shadow-xs flex items-start gap-3.5 text-left hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-purple-100">
                <MapPin className="w-6 h-6 text-[#4A0E4E]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 leading-tight">
                  Ambil / Antar Griya 5
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Pilih kue favorit Anda, ambil langsung di dapur atau diantar khusus area Perum Griya Cileungsi 5.
                </p>
              </div>
            </div>

            {/* Fitur 2: 100% Halal & Higienis */}
            <div className="bg-emerald-50/70 border border-emerald-100/60 p-6 rounded-2xl shadow-xs flex items-start gap-3.5 text-left hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-[#15803D]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 leading-tight">
                  100% Halal &amp; Higienis
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Seluruh olahan kue dibuat higienis dengan bahan segar berkualitas tanpa bahan pengawet berbahaya.
                </p>
              </div>
            </div>

            {/* Fitur 3: Kualitas & Rasa Terbaik */}
            <div className="bg-amber-50/70 border border-amber-100/60 p-6 rounded-2xl shadow-xs flex items-start gap-3.5 text-left hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-amber-100">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 leading-tight">
                  Kualitas &amp; Rasa
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Dibuat fresh setiap hari dengan resep autentik rumahan untuk cita rasa istimewa terjangkau.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Layout: Sleek Horizontal Scroll Strip - Nyaman di Mata & Hemat Ruang */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/80 border border-purple-100/90 text-[#4A0E4E] shrink-0 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#4A0E4E]" />
              <span className="text-[11px] font-bold">Antar Griya Cileungsi 5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-100/90 text-emerald-800 shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold">100% Halal &amp; Higienis</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-100/90 text-amber-800 shrink-0 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-bold">Resep Rumahan Fresh</span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: KATEGORI PRODUK (Desktop Grid Only)                 */}
        {/* ============================================================== */}
        <section className="hidden md:block mx-auto max-w-7xl px-2.5 sm:px-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Kategori Produk
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Pilih kategori kue &amp; camilan favorit Anda
              </p>
            </div>
            <Link
              className="text-xs sm:text-sm font-semibold text-[#4A0E4E] hover:underline flex items-center gap-0.5 shrink-0"
              href="/produk"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-5">
            {categoryCircles.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.name}
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-300 text-center active:scale-95"
                  href={`/produk?category=${cat.slug}`}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-700 group-hover:bg-[#4A0E4E] group-hover:text-white group-hover:border-[#4A0E4E] group-hover:scale-105 transition-all duration-300 shadow-2xs mb-1.5 sm:mb-2.5">
                    <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-base text-stone-900 group-hover:text-[#4A0E4E] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium hidden md:block mt-1 leading-snug">
                    {cat.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: PRODUK POPULER & MENU PILIHAN (App-Style Browsing)   */}
        {/* ============================================================== */}
        <section className="mx-auto max-w-7xl px-2.5 sm:px-6 space-y-3.5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#4A0E4E] text-[10px] sm:text-xs font-bold mb-1">
                <Sparkles className="w-3 h-3 text-[#4A0E4E]" />
                <span>Menu Pilihan Fresh</span>
              </div>
              <h2 className="text-base sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                Katalog Menu Dapur Rasa
              </h2>
              <p className="text-[11px] sm:text-sm text-stone-500">
                Paling banyak dicari &amp; dibuat fresh setiap hari
              </p>
            </div>
            <Link
              className="text-xs sm:text-sm font-semibold text-[#4A0E4E] hover:underline flex items-center gap-0.5 shrink-0"
              href="/produk"
            >
              <span>Semua Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Horizontal Category Filter Chips - Sangat nyaman di mobile & tablet */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
            {MOBILE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              const count =
                cat.value === "ALL"
                  ? products.length
                  : products.filter((p) => {
                      const c =
                        typeof p.category === "string"
                          ? p.category
                          : (p.category as any)?.name || "";
                      return c.toLowerCase().includes(cat.value.toLowerCase());
                    }).length;

              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-[#4A0E4E] text-white shadow-xs shadow-purple-900/20"
                      : "bg-white text-stone-700 border border-stone-200/90 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Skeleton loading or 2-Column Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-3 space-y-2.5 animate-pulse"
                >
                  <div className="aspect-square w-full rounded-xl bg-stone-100" />
                  <div className="h-3 w-16 bg-stone-100 rounded" />
                  <div className="h-4 w-full bg-stone-100 rounded" />
                  <div className="h-4 w-2/3 bg-stone-100 rounded" />
                  <div className="pt-2 flex justify-between items-center mt-auto">
                    <div className="h-4 w-16 bg-stone-100 rounded" />
                    <div className="h-8 w-20 bg-stone-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-[#4A0E4E] flex items-center justify-center mx-auto">
                <Cake className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-800">
                Belum ada produk untuk kategori ini
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className="px-4 py-2 rounded-xl bg-[#4A0E4E] text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                Tampilkan Semua Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-full">
              {filteredProducts.map((prod) => {
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
                    className="group relative flex flex-col min-w-0 w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition-all duration-300 hover:border-purple-300 hover:shadow-md justify-between"
                  >
                    {/* Photo: aspect-square agar foto kue utuh proporsional */}
                    <div className="relative aspect-square w-full overflow-hidden bg-stone-50">
                      <Link
                        className="block w-full h-full"
                        href={`/produk/${prod.slug}`}
                        prefetch={true}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={prod.name}
                          src={primaryImage}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                        {isOutOfStock ? (
                          <span className="rounded-full bg-stone-900/85 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-2xs backdrop-blur-2xs">
                            Habis
                          </span>
                        ) : prod.isBestSeller ? (
                          <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-2xs backdrop-blur-2xs">
                            ★ Favorit
                          </span>
                        ) : prod.badge ? (
                          <span className="rounded-full bg-[#4A0E4E]/90 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-2xs backdrop-blur-2xs">
                            {prod.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Tombol Like Pojok Kanan Atas */}
                      <div className="absolute top-2 right-2 z-10">
                        <ProductLikeButton product={prod} size="sm" />
                      </div>
                    </div>

                    {/* Body Info: Judul Kue 2 Baris Bersih & Terbaca Jelas */}
                    <div className="p-3 sm:p-3.5 flex flex-1 flex-col justify-between space-y-2 min-w-0 bg-white">
                      <div className="min-w-0">
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase text-[#4A0E4E] tracking-wider block truncate mb-0.5">
                          {categoryDisplay}
                        </span>
                        <Link href={`/produk/${prod.slug}`} prefetch={true} className="block leading-snug min-w-0">
                          <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 group-hover:text-[#4A0E4E] transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                            {prod.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Bottom Action Bar: Harga & Tombol + Keranjang yang Nyaman Ditekan */}
                      <div className="pt-2 border-t border-stone-100 mt-auto min-w-0">
                        {/* Mobile Layout (< sm): Harga Jelas & Tombol Nyaman Dilihat & Ditekan */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-black text-[#4A0E4E] font-mono leading-none">
                              {formatPrice(currentPrice)}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">/{prod.unit}</span>
                          </div>
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickAdd(prod);
                            }}
                            className={`w-full h-8.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
                              isOutOfStock
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-[#4A0E4E] text-white hover:bg-[#5C1261] shadow-purple-900/10"
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? "Stok Habis" : "+ Keranjang"}</span>
                          </button>
                        </div>

                        {/* Desktop Layout (>= sm): Berdampingan Rapi */}
                        <div className="hidden sm:flex items-center justify-between gap-1.5">
                          <p className="text-sm md:text-base font-extrabold text-[#4A0E4E] font-mono leading-none truncate">
                            {formatPrice(currentPrice)}
                          </p>
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickAdd(prod);
                            }}
                            className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0 active:scale-95 cursor-pointer ${
                              isOutOfStock
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white"
                            }`}
                            title={isOutOfStock ? "Habis" : "Tambah ke Keranjang"}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? "Habis" : "+ Keranjang"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: GALERI FOTO KUE & CAMILAN (Visual Showcase Dapur Rasa) */}
        {/* ============================================================== */}
        <section id="galeri-section" className="hidden md:block mx-auto max-w-7xl px-2.5 sm:px-6 space-y-4 sm:space-y-6 pt-4 border-t border-gray-100 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4A0E4E] mb-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#4A0E4E]" />
                <span>Koleksi Visual Toko</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Galeri Foto Kue &amp; Camilan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Foto asli olahan aneka pastel renyah, risol mayo lumer, kue basah, dan snack box Dapur Rasa
              </p>
            </div>
            <Link
              className="text-xs sm:text-sm font-semibold text-[#4A0E4E] hover:underline flex items-center gap-0.5 shrink-0 self-start sm:self-auto"
              href="/galeri"
            >
              <span>Buka Galeri Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Gallery Category Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {galleryTags.map((tag) => {
              const isSelected = selectedGalleryTag === tag;
              return (
                <button
                  key={tag as string}
                  onClick={() => handleGalleryTagChange(tag as string)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#4A0E4E] text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Gallery Grid (2 Columns on Mobile, 3 on Tablet, 4 on Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {displayedGalleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex((galleryPage - 1) * GALLERY_PER_PAGE + idx)}
                className="group relative flex flex-col overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all duration-300 cursor-pointer"
              >
                {/* Photo with zoom effect */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={item.altText || item.title}
                    src={item.imageUrl}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-108"
                  />
                  {item.categoryTag && (
                    <span className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 rounded-full bg-white/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wide text-[#4A0E4E] shadow-xs">
                      {item.categoryTag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/95 text-gray-900 text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                      <Eye className="w-3.5 h-3.5 text-[#4A0E4E]" />
                      <span>Lihat Foto</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-[#4A0E4E] transition-colors line-clamp-1 leading-snug">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Gallery Pagination Controls (8 foto per halaman) */}
          {totalGalleryPages > 1 && (
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 order-2 sm:order-1 font-medium">
                Menampilkan {(galleryPage - 1) * GALLERY_PER_PAGE + 1}&ndash;{Math.min(galleryPage * GALLERY_PER_PAGE, filteredGalleryItems.length)} dari{" "}
                <strong className="text-gray-800">{filteredGalleryItems.length}</strong> foto galeri
              </span>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  disabled={galleryPage === 1}
                  onClick={() => {
                    setGalleryPage((p) => Math.max(1, p - 1));
                    document.getElementById("galeri-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-2xs cursor-pointer"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Prev</span>
                </button>

                {Array.from({ length: totalGalleryPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setGalleryPage(pageNum);
                      document.getElementById("galeri-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                      galleryPage === pageNum
                        ? "bg-[#4A0E4E] text-white shadow-xs font-extrabold"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={galleryPage === totalGalleryPages}
                  onClick={() => {
                    setGalleryPage((p) => Math.min(totalGalleryPages, p + 1));
                    document.getElementById("galeri-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-2xs cursor-pointer"
                  aria-label="Halaman Selanjutnya"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: CARA BELANJA MUDAH (2x2 Grid on Mobile)             */}
        {/* ============================================================== */}
        <section className="hidden md:block mx-auto max-w-7xl px-2.5 sm:px-6 py-4 sm:py-6 border-t border-gray-100">
          <div className="text-center space-y-1 sm:space-y-2 mb-6 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Cara Belanja Mudah
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Pesan secara online dan ambil belanjaan langsung di dapur kami atau dikirim via kurir
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-8 md:p-10 shadow-xs relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50/60 border border-gray-100/80 space-y-2 relative group hover:border-purple-200 transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#4A0E4E]/10 flex items-center justify-center text-[#4A0E4E] shadow-2xs group-hover:bg-[#4A0E4E] group-hover:text-white transition-all duration-300">
                    <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A0E4E] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Pilih Produk</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed px-1">
                  Pilih aneka kue rumahan dan camilan berkualitas dari katalog.
                </p>
              </div>

              {/* Connecting Chevron 1 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[21%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50/60 border border-gray-100/80 space-y-2 relative group hover:border-sky-200 transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#4B95FF]/10 flex items-center justify-center text-[#4B95FF] shadow-2xs group-hover:bg-[#4B95FF] group-hover:text-white transition-all duration-300">
                    <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4B95FF] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    2
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Keranjang Belanja</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed px-1">
                  Masukkan pilihan kue Anda ke dalam keranjang belanja.
                </p>
              </div>

              {/* Connecting Chevron 2 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[46%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50/60 border border-gray-100/80 space-y-2 relative group hover:border-emerald-200 transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Phone className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    3
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Kirim WA &amp; Alamat</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed px-1">
                  Kirim ke WA toko dan sertakan alamat pengantaran atau jam ambil.
                </p>
              </div>

              {/* Connecting Chevron 3 (Desktop Only) */}
              <div className="hidden md:flex items-center justify-center absolute top-7 left-[71%] w-[8%] text-gray-300 pointer-events-none">
                <ChevronRight className="w-6 h-6" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50/60 border border-gray-100/80 space-y-2 relative group hover:border-amber-200 transition">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-2xs group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Store className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-xs">
                    4
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-800 text-xs sm:text-sm">Ambil / Antar</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed px-1">
                  Ambil di dapur atau terima kiriman di Griya Cileungsi 5.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: FAQ - PERTANYAAN UMUM (Interactive Accordion)       */}
        {/* ============================================================== */}
        <section id="faq" className="mx-auto max-w-4xl px-2.5 sm:px-6 space-y-6 pt-4 border-t border-gray-100 scroll-mt-24">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#4A0E4E] text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-[#4A0E4E]" />
              <span>Pusat Informasi &amp; Bantuan</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
              Temukan jawaban cepat seputar pemesanan kue, ketentuan pengantaran gratis ongkir di Griya Cileungsi 5, dan cara penyajian.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Kapan jam operasional buka dan jadwal pelayanan Dapur Rasa?",
                a: `Dapur Rasa melayani pemesanan setiap hari Senin sampai Sabtu, pukul 05.00 – 22.00 WIB. Khusus hari Minggu toko kami tutup. Untuk pertanyaan, konsultasi menu acara, atau pesanan langsung, Anda dapat menghubungi WhatsApp kami di ${getWhatsAppDisplayNumber(settings?.whatsappNumber)}.`
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
                  className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-gray-50/80 transition cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                      {faq.q}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-purple-100 text-[#4A0E4E]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-purple-50/20 animate-fadeIn">
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
      {lightboxIndex !== null && filteredGalleryItems[lightboxIndex] && (
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
                src={filteredGalleryItems[lightboxIndex].imageUrl}
                alt={filteredGalleryItems[lightboxIndex].title}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-4 sm:p-6 text-white w-full space-y-1.5 bg-gray-900">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#4A0E4E] text-white">
                  {filteredGalleryItems[lightboxIndex].categoryTag || "Koleksi Dapur Rasa"}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {lightboxIndex + 1} / {filteredGalleryItems.length}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold">
                {filteredGalleryItems[lightboxIndex].title}
              </h3>
              {filteredGalleryItems[lightboxIndex].caption && (
                <p className="text-xs sm:text-sm text-gray-300">
                  {filteredGalleryItems[lightboxIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

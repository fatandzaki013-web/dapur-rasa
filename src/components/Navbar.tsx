"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  UtensilsCrossed,
  Phone,
  Home,
  Cake,
  Image as ImageIcon,
  HelpCircle,
  BookOpen,
  Info,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useStore();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist, setIsWishlistOpen } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Secret 5-click easter egg to open admin login
  const secretClickCountRef = useRef(0);
  const secretResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (secretResetTimerRef.current) {
        clearTimeout(secretResetTimerRef.current);
      }
    };
  }, []);

  const handleBrandLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (secretResetTimerRef.current) {
      clearTimeout(secretResetTimerRef.current);
    }

    secretClickCountRef.current += 1;

    if (secretClickCountRef.current >= 5) {
      e.preventDefault();
      secretClickCountRef.current = 0;
      router.push("/admin/login");
      return;
    }

    secretResetTimerRef.current = setTimeout(() => {
      secretClickCountRef.current = 0;
    }, 2500);
  };



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Skip rendering navbar inside admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const rawWa = (settings?.whatsappNumber || "085888159765").replace(/[^0-9]/g, "");
  const waLinkNum = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : (rawWa.startsWith("62") ? rawWa : "6285888159765");
  const waDisplayNum = rawWa.startsWith("62") ? "0" + rawWa.slice(2) : (rawWa.startsWith("0") ? rawWa : "085888159765");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Beranda", href: "/", icon: Home, desc: "Halaman utama toko" },
    { label: "Produk", href: "/produk", icon: Cake, desc: "Katalog aneka kue & frozen" },
    { label: "Galeri", href: "/galeri", icon: ImageIcon, desc: "Koleksi foto olahan dapur" },
    { label: "FAQ", href: "/#faq", icon: HelpCircle, desc: "Pertanyaan seputar pemesanan & ongkir" },
    { label: "Artikel", href: "/artikel", icon: BookOpen, desc: "Tips & info menarik" },
    { label: "Tentang Kami", href: "/tentang-kami", icon: Info, desc: "Dapur Griya Cileungsi 5" },
    { label: "Kontak", href: "/kontak", icon: Phone, desc: "Lokasi & nomor WhatsApp" },
  ];

  const categoryShortcuts = [
    { name: "Pastel", slug: "pastel", emoji: "🥟" },
    { name: "Risol", slug: "risol", emoji: "🌯" },
    { name: "Sosis Solo", slug: "sosis-solo", emoji: "🥖" },
    { name: "Brownies", slug: "brownies-bolu", emoji: "🍫" },
    { name: "Kue Basah", slug: "aneka-kue-basah", emoji: "🍰" },
    { name: "Snack Box", slug: "snack-box", emoji: "🍱" },
    { name: "Frozen", slug: "frozen-food", emoji: "❄️" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isScrolled ? "pt-1.5 sm:pt-2" : "pt-2 sm:pt-4"
        }`}
      >
        <div className="mx-auto max-w-7xl px-2.5 sm:px-4">
          <div
            className={`flex items-center justify-between transition-all duration-300 h-14 sm:h-16 px-3 sm:px-6 rounded-2xl bg-white/95 backdrop-blur-md shadow-sm sm:shadow-md border border-gray-100 ${
              isScrolled ? "shadow-md border-gray-200" : ""
            }`}
          >
            {/* Brand Logo & Name */}
            <Link
              href="/"
              onClick={handleBrandLogoClick}
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 group"
            >
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#4A0E4E] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-xl tracking-tight text-[#4A0E4E] leading-tight">
                  {brandName}
                </span>
                <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-semibold -mt-0.5 tracking-wider uppercase hidden xs:inline">
                  Kue &amp; Camilan Rumahan
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.slice(0, 6).map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href) && pathname !== "/";
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#4A0E4E]/10 text-[#4A0E4E] font-bold"
                        : "text-gray-600 hover:text-[#4A0E4E] hover:bg-[#4A0E4E]/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center relative max-w-[190px] lg:max-w-[240px] w-full mx-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk favoritmu..."
                className="w-full h-8 pl-3 pr-8 rounded-full border border-gray-200/80 focus:outline-none focus:border-[#4A0E4E]/50 text-[11px] transition bg-gray-50/50 focus:bg-white text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4A0E4E] cursor-pointer"
                title="Cari"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-rose-50 relative w-8 h-8 sm:w-9 sm:h-9 text-gray-600 hover:text-rose-600 cursor-pointer"
                aria-label="Buka daftar disukai"
                title="Produk Disukai"
              >
                <Heart
                  className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-colors ${
                    totalWishlist > 0 ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-scaleIn">
                    {totalWishlist}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-[#4A0E4E]/10 relative w-8 h-8 sm:w-9 sm:h-9 text-gray-600 hover:text-[#4A0E4E] cursor-pointer"
                aria-label="Buka keranjang"
                title="Keranjang Belanja"
              >
                <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#4A0E4E] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-scaleIn">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button (Garis 3 di Kanan Atas) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                  mobileMenuOpen
                    ? "bg-[#4A0E4E] text-white shadow-xs"
                    : "hover:bg-[#4A0E4E]/10 text-gray-800"
                }`}
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE MENU DRAWER ELEGAN (Garis 3 Kanan Atas Diperbagus Total)  */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
          {/* Backdrop Blur Gelap */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Slide-down Card */}
          <div className="fixed inset-x-2.5 top-16 bottom-4 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50 animate-slideDown">
            {/* Header Drawer */}
            <div className="p-4 bg-gradient-to-r from-[#4A0E4E] to-[#6A1B6E] text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight font-heading">
                    {brandName}
                  </h3>
                  <p className="text-[10px] text-amber-200 font-medium">
                    Kue Rumahan &amp; Frozen Food Fresh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Search Bar Kompak */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pastel, risol mayo, bolu, snack box..."
                  className="w-full h-11 pl-10 pr-10 rounded-2xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E] text-gray-800"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Kategori Populer Cepat (Chips) */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-gray-400 block px-0.5">
                  Kategori Pilihan
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categoryShortcuts.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/produk?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#4A0E4E] text-[11px] font-bold shrink-0 border border-purple-100 flex items-center gap-1 transition shadow-2xs"
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigasi Menu Lengkap Berdesain Kartu Cantik */}
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-gray-400 block px-0.5">
                  Menu Utama Toko
                </span>
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href) && pathname !== "/";
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                          isActive
                            ? "bg-[#4A0E4E] text-white shadow-xs"
                            : "hover:bg-purple-50/70 text-gray-700 bg-gray-50/60 border border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-purple-100 text-[#4A0E4E]"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs block leading-tight">
                              {link.label}
                            </span>
                            <span
                              className={`text-[10px] block leading-tight mt-0.5 ${
                                isActive ? "text-purple-200" : "text-gray-400"
                              }`}
                            >
                              {link.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : "text-gray-400"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Akses Cepat Disukai & Keranjang */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 font-bold text-xs shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Koleksi Disukai ({totalWishlist})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 border border-purple-200/80 text-[#4A0E4E] font-bold text-xs shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-[#4A0E4E]" />
                  <span>Keranjang ({totalItems})</span>
                </button>
              </div>

              {/* Chat WhatsApp & Admin Login Link */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <a
                  href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent(
                    "Halo Dapur Rasa, saya ingin konsultasi / pesan kue..."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Chat Langsung ke WhatsApp Dapur</span>
                </a>

                              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

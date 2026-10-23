"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  LayoutDashboard,
  UtensilsCrossed,
  Lock,
  Phone,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useStore();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Skip rendering navbar inside admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const whatsappNum = (settings?.whatsappNumber || "085888159765").replace(/[^0-9]/g, "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: "Galeri", href: "/galeri" },
    { label: "Artikel", href: "/artikel" },
    { label: "Tentang Kami", href: "/tentang-kami" },
  ];

  return (
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
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
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
            {navLinks.map((link) => {
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

          {/* Right Action Icons: Dashboard + Wishlist + Cart + Mobile Menu Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Dashboard Button */}
            <Link
              href="/admin/login"
              className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-[#4A0E4E]/10 w-8 h-8 sm:w-9 sm:h-9 text-gray-600 hover:text-[#4A0E4E]"
              title="Dashboard Admin (Login)"
            >
              <LayoutDashboard className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/produk"
              className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-[#4A0E4E]/10 w-8 h-8 sm:w-9 sm:h-9 text-gray-600 hover:text-[#4A0E4E]"
              title="Katalog Produk"
            >
              <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-[#4A0E4E]/10 relative w-8 h-8 sm:w-9 sm:h-9 text-gray-600 hover:text-[#4A0E4E] cursor-pointer"
              aria-label="Buka keranjang"
            >
              <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#4A0E4E] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-scaleIn">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-[#4A0E4E]/10 transition-colors text-gray-700 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Clean, Modern Card Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-2.5 sm:mx-4 mt-2 p-4 bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/90 animate-fadeIn space-y-3 z-50">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pastel, risol, bolu, snack box..."
              className="w-full h-10 pl-3.5 pr-10 rounded-2xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#4A0E4E] text-gray-800"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4A0E4E]"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Mobile Navigation Links (2 Columns Grid) */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href) && pathname !== "/";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center ${
                    isActive
                      ? "bg-[#4A0E4E] text-white shadow-xs"
                      : "bg-gray-50 text-gray-700 hover:bg-[#4A0E4E]/10 hover:text-[#4A0E4E]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent("Halo Dapur Rasa, saya ingin bertanya tentang pesanan kue...")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi WhatsApp Toko</span>
            </a>

            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span>Masuk Dashboard Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

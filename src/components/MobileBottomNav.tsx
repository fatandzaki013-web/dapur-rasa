"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cake, Image as ImageIcon, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, isCartOpen } = useCart();
  const { totalWishlist, setIsWishlistOpen, isWishlistOpen } = useWishlist();

  // Sembunyikan bottom nav di dashboard admin, saat checkout, saat di detail produk, atau saat drawer keranjang/wishlist aktif
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    (pathname.startsWith("/produk/") && pathname !== "/produk") ||
    isCartOpen ||
    isWishlistOpen
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/produk");
  const isGallery = pathname.startsWith("/galeri");

  return (
    <nav
      aria-label="Floating Bottom Navigation Dock"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] h-[68px] bg-[#123829] rounded-[28px] flex items-center justify-between px-6 z-50 shadow-[0_16px_36px_-6px_rgba(18,56,41,0.48)] border border-[#2E9E6B]/20"
    >
      {/* 1. Home (Rumah) */}
      <Link
        href="/"
        aria-label="Beranda"
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group"
      >
        <Home
          className={`w-[22px] h-[22px] stroke-[2] transition-transform active:scale-90 ${
            isHome ? "text-[#47C98E]" : "text-white/70 group-hover:text-white"
          }`}
        />
        {isHome && <span className="w-1.5 h-1.5 rounded-full bg-[#47C98E] mt-1 shadow-[0_0_8px_#47C98E]" />}
      </Link>

      {/* 2. Menu / Produk */}
      <Link
        href="/produk"
        aria-label="Menu Produk"
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group"
      >
        <Cake
          className={`w-[22px] h-[22px] stroke-[2] transition-transform active:scale-90 ${
            isProducts ? "text-[#47C98E]" : "text-white/70 group-hover:text-white"
          }`}
        />
        {isProducts && <span className="w-1.5 h-1.5 rounded-full bg-[#47C98E] mt-1 shadow-[0_0_8px_#47C98E]" />}
      </Link>

      {/* 3. Center FAB (Keranjang Belanja) */}
      <div className="relative flex items-center justify-center shrink-0 -translate-y-4">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-[#47C98E] to-[#2E9E6B] border-4 border-[#123829] shadow-[0_10px_24px_rgba(46,158,107,0.48)] flex items-center justify-center text-white active:scale-90 hover:scale-105 transition-transform cursor-pointer relative"
          aria-label="Buka Keranjang Belanja"
        >
          <ShoppingCart className="w-[22px] h-[22px] text-white stroke-[2.2]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-[#123829] animate-scaleIn">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>
      </div>

      {/* 4. Wishlist / Favorit */}
      <button
        type="button"
        onClick={() => setIsWishlistOpen(true)}
        aria-label="Produk Disukai"
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group relative cursor-pointer active:scale-90"
      >
        <Heart
          className={`w-[22px] h-[22px] stroke-[2] transition-transform ${
            totalWishlist > 0 ? "fill-rose-400 text-rose-400 stroke-rose-400" : "text-white/70 group-hover:text-white"
          }`}
        />
        {totalWishlist > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-2xs">
            {totalWishlist}
          </span>
        )}
      </button>

      {/* 5. Galeri */}
      <Link
        href="/galeri"
        aria-label="Galeri Foto"
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group"
      >
        <ImageIcon
          className={`w-[22px] h-[22px] stroke-[2] transition-transform active:scale-90 ${
            isGallery ? "text-[#47C98E]" : "text-white/70 group-hover:text-white"
          }`}
        />
        {isGallery && <span className="w-1.5 h-1.5 rounded-full bg-[#47C98E] mt-1 shadow-[0_0_8px_#47C98E]" />}
      </Link>
    </nav>
  );
}

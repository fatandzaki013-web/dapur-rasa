"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cake, Image as ImageIcon, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist, setIsWishlistOpen } = useWishlist();

  // Sembunyikan bottom nav di dashboard admin, saat checkout, atau saat di detail produk (karena detail produk punya sticky bar sendiri)
  if (
    pathname.startsWith("/admin") ||
    pathname === "/checkout" ||
    (pathname.startsWith("/produk/") && pathname !== "/produk")
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/produk");
  const isGallery = pathname.startsWith("/galeri");

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] z-50 h-[68px] px-5 bg-[#123829] rounded-[28px] shadow-[0_16px_32px_-6px_rgba(18,56,41,0.28)] flex items-center justify-between text-white/75 border border-white/10 backdrop-blur-md"
    >
      {/* 1. Beranda */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 transition-colors min-w-[48px] ${
          isHome ? "text-[#47C98E] font-bold" : "hover:text-white"
        }`}
      >
        <Home className="w-5 h-5 transition-transform active:scale-90" />
        <span className="text-[10px] font-semibold leading-tight mt-1">Beranda</span>
      </Link>

      {/* 2. Menu / Produk */}
      <Link
        href="/produk"
        className={`flex flex-col items-center justify-center py-1 transition-colors min-w-[48px] ${
          isProducts ? "text-[#47C98E] font-bold" : "hover:text-white"
        }`}
      >
        <Cake className="w-5 h-5 transition-transform active:scale-90" />
        <span className="text-[10px] font-semibold leading-tight mt-1">Menu</span>
      </Link>

      {/* 3. Center FAB: Keranjang Belanja */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative -translate-y-4 w-[58px] h-[58px] rounded-full bg-gradient-to-br from-[#47C98E] to-[#2E9E6B] border-[5px] border-white shadow-[0_8px_22px_rgba(46,158,107,0.45)] flex items-center justify-center text-white active:scale-95 hover:scale-105 transition-transform cursor-pointer shrink-0"
        aria-label="Buka Keranjang Belanja"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white animate-scaleIn">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      {/* 4. Favorit (Wishlist) */}
      <button
        type="button"
        onClick={() => setIsWishlistOpen(true)}
        className="flex flex-col items-center justify-center py-1 text-white/75 hover:text-white transition-colors relative cursor-pointer min-w-[48px]"
        aria-label="Produk Disukai"
      >
        <div className="relative">
          <Heart
            className={`w-5 h-5 transition-transform active:scale-90 ${
              totalWishlist > 0 ? "fill-rose-400 text-rose-400" : ""
            }`}
          />
          {totalWishlist > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-2xs">
              {totalWishlist}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-semibold leading-tight mt-1 ${
            totalWishlist > 0 ? "text-rose-300" : ""
          }`}
        >
          Favorit
        </span>
      </button>

      {/* 5. Galeri */}
      <Link
        href="/galeri"
        className={`flex flex-col items-center justify-center py-1 transition-colors min-w-[48px] ${
          isGallery ? "text-[#47C98E] font-bold" : "hover:text-white"
        }`}
      >
        <ImageIcon className="w-5 h-5 transition-transform active:scale-90" />
        <span className="text-[10px] font-semibold leading-tight mt-1">Galeri</span>
      </Link>
    </nav>
  );
}

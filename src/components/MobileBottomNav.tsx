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

  // Sembunyikan bottom nav di dashboard admin, saat checkout, atau saat di detail produk
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
      aria-label="Curved-Notch Floating Bottom Navigation Dock"
      className="md:hidden fixed bottom-[14px] left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[394px] h-[68px] bg-[#123829] rounded-[26px] flex items-center justify-between px-[26px] z-50 shadow-[0_16px_32px_-6px_rgba(18,56,41,0.26)]"
    >
      {/* 1. Home */}
      <Link
        href="/"
        aria-label="Beranda"
        className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
          isHome ? "text-[#47C98E]" : "text-white/75 hover:text-white"
        }`}
      >
        <Home className="w-[22px] h-[22px] stroke-[1.9] transition-transform active:scale-90" />
      </Link>

      {/* 2. Menu / Produk */}
      <Link
        href="/produk"
        aria-label="Menu Produk"
        className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
          isProducts ? "text-[#47C98E]" : "text-white/75 hover:text-white"
        }`}
      >
        <Cake className="w-[22px] h-[22px] stroke-[1.9] transition-transform active:scale-90" />
      </Link>

      {/* 3. Lekukan Cekung (Concave Cutout) & Center FAB (Keranjang) */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className="w-[72px] h-[72px] rounded-full bg-white -translate-y-[22px] flex items-center justify-center shadow-xs">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#47C98E] to-[#2E9E6B] shadow-[0_8px_20px_rgba(46,158,107,0.42)] flex items-center justify-center text-white active:scale-95 hover:scale-105 transition-transform cursor-pointer relative"
            aria-label="Buka Keranjang Belanja"
          >
            <ShoppingCart className="w-[22px] h-[22px] text-white stroke-[2.2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white animate-scaleIn">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Wishlist / Favorit */}
      <button
        type="button"
        onClick={() => setIsWishlistOpen(true)}
        aria-label="Produk Disukai"
        className="flex items-center justify-center p-2 rounded-xl text-white/75 hover:text-white transition-colors relative cursor-pointer"
      >
        <Heart
          className={`w-[22px] h-[22px] stroke-[1.9] transition-transform active:scale-90 ${
            totalWishlist > 0 ? "fill-rose-400 text-rose-400 stroke-rose-400" : ""
          }`}
        />
        {totalWishlist > 0 && (
          <span className="absolute top-0 right-0 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-2xs">
            {totalWishlist}
          </span>
        )}
      </button>

      {/* 5. Galeri */}
      <Link
        href="/galeri"
        aria-label="Galeri Foto"
        className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
          isGallery ? "text-[#47C98E]" : "text-white/75 hover:text-white"
        }`}
      >
        <ImageIcon className="w-[22px] h-[22px] stroke-[1.9] transition-transform active:scale-90" />
      </Link>
    </nav>
  );
}

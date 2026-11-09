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
  if (pathname.startsWith("/admin") || pathname === "/checkout" || (pathname.startsWith("/produk/") && pathname !== "/produk")) {
    return null;
  }

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/produk");
  const isGallery = pathname.startsWith("/galeri");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center text-center">
        {/* 1. Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? "text-[#123829] font-bold" : "text-[#687871] hover:text-[#111915]"
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isHome ? "bg-[#E8F5EE]" : ""}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Beranda</span>
        </Link>

        {/* 2. Menu / Produk */}
        <Link
          href="/produk"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isProducts ? "text-[#123829] font-bold" : "text-[#687871] hover:text-[#111915]"
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isProducts ? "bg-[#E8F5EE]" : ""}`}>
            <Cake className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Menu Kue</span>
        </Link>

        {/* 3. Galeri */}
        <Link
          href="/galeri"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isGallery ? "text-[#123829] font-bold" : "text-[#687871] hover:text-[#111915]"
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isGallery ? "bg-[#E8F5EE]" : ""}`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Galeri</span>
        </Link>

        {/* 4. Disukai (Wishlist) */}
        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-[#687871] hover:text-rose-600 transition-colors relative cursor-pointer"
          aria-label="Produk Disukai"
        >
          <div className="p-1 rounded-xl relative">
            <Heart className={`w-5 h-5 ${totalWishlist > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
            {totalWishlist > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-2xs">
                {totalWishlist}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Disukai</span>
        </button>

        {/* 5. Keranjang Belanja */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-[#687871] hover:text-[#123829] transition-colors relative cursor-pointer"
          aria-label="Keranjang Belanja"
        >
          <div className="p-1 rounded-xl relative">
            <ShoppingCart className="w-5 h-5 text-[#123829]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-scaleIn border-2 border-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[#123829] leading-tight mt-0.5">
            Keranjang
          </span>
        </button>
      </div>
    </div>
  );
}

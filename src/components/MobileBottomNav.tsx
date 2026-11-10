"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cake, Image as ImageIcon, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, isCartOpen } = useCart();
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
      </Link>

      {/* 3. Center FAB (Pilihan Produk & Belanja Langsung) */}
      <div className="relative flex items-center justify-center shrink-0 -translate-y-4">
        <Link
          href="/produk"
          prefetch={true}
          className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-[#47C98E] to-[#2E9E6B] border-4 border-[#123829] shadow-[0_10px_24px_rgba(46,158,107,0.48)] flex items-center justify-center text-white active:scale-90 hover:scale-105 transition-transform cursor-pointer relative"
          aria-label="Lihat Semua Pilihan Produk & Mulai Belanja"
          title="Semua Pilihan Produk"
        >
          <ShoppingCart className="w-[22px] h-[22px] text-white stroke-[2.2]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-[#123829] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-[#47C98E] animate-scaleIn">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>
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
            totalWishlist > 0 ? "fill-[#47C98E] text-[#47C98E] stroke-[#47C98E]" : "text-white/70 group-hover:text-white"
          }`}
        />
        {totalWishlist > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-[#47C98E] text-[#123829] text-[9px] font-black rounded-full flex items-center justify-center shadow-2xs">
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
      </Link>
    </nav>
  );
}

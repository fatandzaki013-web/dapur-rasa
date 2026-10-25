"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";

export default function WishlistDrawer() {
  const { wishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen, clearWishlist } =
    useWishlist();
  const { addItem, setIsCartOpen } = useCart();
  const { formatPrice } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isWishlistOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: any) => {
    const res = addItem(product, null, 1);
    showToast(res.message);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((product) => {
      addItem(product, null, 1);
    });
    showToast(`${wishlist.length} produk favorit dimasukkan ke keranjang!`);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Toast Notification inside Wishlist */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header Drawer */}
          <div className="px-5 py-4 bg-[#4A0E4E] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-heading">
                Produk Disukai ({wishlist.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Heart className="w-8 h-8 fill-rose-100 text-rose-400" />
                </div>
                <h3 className="text-stone-800 font-bold mb-1">Belum Ada Produk yang Disukai</h3>
                <p className="text-xs sm:text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                  Klik ikon hati ❤️ di atas gambar produk untuk menyimpan kue favorit Anda ke daftar ini.
                </p>
                <Link
                  href="/produk"
                  onClick={() => setIsWishlistOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A0E4E] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#5C1261] transition shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Jelajahi Menu Kue</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
                  <span>Daftar kue favorit Anda</span>
                  <button
                    onClick={clearWishlist}
                    className="text-stone-400 hover:text-red-600 transition text-[11px] font-medium cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                {wishlist.map((item) => {
                  const imageUrl =
                    item.images && item.images.length > 0
                      ? item.images[0].url
                      : (item as any).imageUrl || null;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3.5 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/80 items-center hover:bg-stone-50 transition"
                    >
                      {/* Thumbnail */}
                      <Link
                        href={`/produk/${item.slug}`}
                        onClick={() => setIsWishlistOpen(false)}
                        className="w-16 h-16 rounded-xl bg-stone-200 overflow-hidden shrink-0 relative border border-stone-200"
                      >
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            Foto
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/produk/${item.slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="text-xs sm:text-sm font-bold text-stone-900 truncate block hover:text-[#4A0E4E] transition"
                        >
                          {item.name}
                        </Link>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {formatPrice(item.price)} / {item.unit || "pcs"}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>+ Keranjang</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                            title="Hapus dari favorit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer Drawer */}
          {wishlist.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-2.5">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="w-full py-3 px-4 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Masukkan Semua ke Keranjang</span>
              </button>

              <Link
                href="/produk"
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition"
              >
                <span>Lanjutkan Belanja Menu Lainnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

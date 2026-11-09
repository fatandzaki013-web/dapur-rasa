"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
} from "lucide-react";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const { formatPrice } = useStore();

  if (!isCartOpen) return null;

  const totalQuantity = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header Drawer */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-[#123829] text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#47C98E]" />
              </div>
              <h2 className="text-sm sm:text-base font-bold font-heading">
                Keranjang Belanja ({totalQuantity})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-[#E8F5EE] text-[#123829] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-stone-800 font-bold text-sm mb-1">Keranjang Masih Kosong</h3>
                <p className="text-xs text-stone-500 mb-5 max-w-xs mx-auto leading-relaxed">
                  Yuk pilih aneka kue rumahan lezat kami dan masukkan menu favorit Anda ke keranjang.
                </p>
                {/* Lanjutkan Belanja langsung ke /produk */}
                <Link
                  href="/produk"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold rounded-xl transition shadow-md shadow-[#123829]/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mulai Belanja Kue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-[#E8F5EE]/60 rounded-[20px] border border-[#D5EADF] items-center hover:bg-[#E8F5EE] transition shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[14px] bg-stone-200 overflow-hidden shrink-0 border border-[#D5EADF]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                        Foto
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#111915] truncate">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[10px] text-[#123829] font-semibold bg-[#E8F5EE] border border-[#D5EADF] px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                    <div className="text-[11px] text-[#687871] mt-0.5 font-medium">
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity controls (Liquid Glass) */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center rounded-[10px] liquid-glass overflow-hidden h-6 sm:h-7">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-1.5 h-full hover:bg-white/80 text-[#123829] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#111915] min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-1.5 h-full hover:bg-white/80 text-[#123829] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-[#2E9E6B] font-mono ml-auto">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors ml-0.5 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Hapus kue dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Drawer Ringkas & Rapi di Mobile (Bebas Halangan) */}
          {items.length > 0 && (
            <div className="p-4 bg-white/95 backdrop-blur-md border-t border-[#D5EADF] space-y-3 shrink-0 shadow-lg pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))]">
              {/* Badge 1-Baris Free Ongkir */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl liquid-glass-mint text-[11px] font-semibold text-[#123829]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#2E9E6B] shrink-0" />
                  <span>Free Ongkir Area Griya Cileungsi 5</span>
                </div>
                <span className="text-[10px] bg-[#DCEEE5] text-[#123829] px-2 py-0.5 rounded-full font-bold">
                  GRATIS
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs sm:text-sm px-0.5">
                <span className="text-[#687871] font-semibold">Total Pesanan:</span>
                <span className="text-lg sm:text-xl font-extrabold text-[#123829] font-mono">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Action Buttons (Liquid Glass) */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                {/* Tombol 1: Tambah Menu */}
                <Link
                  href="/produk"
                  onClick={() => setIsCartOpen(false)}
                  className="h-11 px-3 rounded-full liquid-glass text-[#111915] font-bold text-xs text-center flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer truncate liquid-glass-shine"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2E9E6B] shrink-0" />
                  <span className="truncate">Tambah Menu</span>
                </Link>

                {/* Tombol 2: Lanjut Bayar / Checkout */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="h-11 px-4 liquid-glass-active text-white font-extrabold rounded-full text-center flex items-center justify-center gap-2 shadow-floating transition active:scale-95 text-xs sm:text-sm cursor-pointer truncate liquid-glass-shine"
                >
                  <span className="truncate">Lanjut Bayar</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-[#47C98E]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

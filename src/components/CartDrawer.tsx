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
  Store,
  Wallet,
  Truck,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const { formatPrice } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header Drawer */}
          <div className="px-5 py-4 bg-[#4A0E4E] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-200" />
              <h2 className="text-base sm:text-lg font-bold font-heading">
                Keranjang Belanja ({items.reduce((acc, it) => acc + it.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-purple-50 text-[#4A0E4E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-stone-800 font-bold mb-1">Keranjang Masih Kosong</h3>
                <p className="text-xs sm:text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                  Yuk jelajahi aneka kue rumahan lezat kami dan masukkan menu favorit Anda ke keranjang.
                </p>
                {/* Lanjutkan Belanja langsung ke /produk */}
                <Link
                  href="/produk"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A0E4E] hover:bg-[#5C1261] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Lanjutkan Belanja Produk</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/80 items-center hover:bg-stone-50 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-200">
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
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[11px] text-[#4A0E4E] font-medium bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {formatPrice(item.price)} / {item.unit || "pcs"}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#4A0E4E] ml-auto">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors ml-1 rounded-lg hover:bg-red-50"
                    title="Hapus kue dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Drawer */}
          {items.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3.5">
              {/* Info Pengantaran & Free Ongkir Sopan */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1.5 shadow-2xs">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Informasi Pengantaran &amp; Pengambilan:</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  🎉 <strong>Gratis Ongkir (Free Ongkir)</strong> khusus untuk seluruh pengantaran di area <strong>Perumahan Griya Cileungsi 5</strong>. Untuk luar area tersebut, tarif ongkir disesuaikan secara terjangkau via kurir.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-[#4A0E4E] font-bold text-[10px]">
                    <Store className="w-3 h-3" />
                    Ambil di Dapur (Gratis)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px]">
                    <Wallet className="w-3 h-3" />
                    Bisa Bayar Tunai (COD)
                  </span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-stone-600 font-medium">Subtotal Produk</span>
                <span className="text-lg font-bold text-[#4A0E4E] font-heading">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Action Buttons: Checkout & Lanjutkan Belanja */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* 1. Tombol Utama: Lanjut ke Checkout */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm active:scale-[0.99]"
                >
                  <span>Lanjut ke Checkout Pesanan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* 2. Tombol Lanjutkan Belanja: Langsung diarahkan ke /produk tanpa form alamat */}
                <Link
                  href="/produk"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  <span>← Lanjutkan Belanja (Pilih Menu Lain)</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

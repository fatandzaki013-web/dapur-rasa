"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import ProductLikeButton from "@/components/ProductLikeButton";

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  promoPrice?: number | null;
  unit: string;
  stock: number;
  isAvailable: boolean;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category: { name: string; slug: string };
  variants?: Array<{ id: string; name: string; priceAdjustment: number; stock: number }>;
  ingredients?: string;
  storageGuide?: string;
  shelfLife?: string;
}

interface ProductQuickViewModalProps {
  product: QuickViewProduct | null;
  onClose: () => void;
  onAddedToCart?: (msg: string) => void;
}

export default function ProductQuickViewModal({
  product,
  onClose,
  onAddedToCart,
}: ProductQuickViewModalProps) {
  const { addItem, setIsCartOpen } = useCart();
  const { formatPrice } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addItem(product, null, quantity);
    if (onAddedToCart) onAddedToCart(res.message);
    if (res.success) {
      setIsCartOpen(true);
      onClose();
    }
  };

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((i) => i.isPrimary)?.url || product.images[0].url
      : "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer z-10"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Photo: Desain Mirip Fitur Tentang Kami (rounded-2xl, aspect-4/3, border-white, shadow, object-cover) */}
          <div style={{ aspectRatio: "4 / 3" }}
            className="sm:col-span-5 aspect-4/3 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-md border-2 sm:border-4 border-white relative group">
            <ProductLikeButton product={product} className="absolute top-2.5 right-2.5 z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {product.category?.name || "Kue & Camilan"}
                </span>
                {product.isAvailable ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Tersedia
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                    Tidak Tersedia
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-heading mt-1 leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#4A0E4E] font-heading">
                {formatPrice(unitPrice)}
              </span>
              <span className="text-xs text-stone-500">/{product.unit}</span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-xs font-semibold text-stone-700">Jumlah:</span>
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white h-8">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 h-full text-stone-600 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  aria-label="Kurangi"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 text-xs font-bold font-mono text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 h-full text-stone-600 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  aria-label="Tambah"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-2.5 px-3.5 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  isOutOfStock
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white cursor-pointer active:scale-95"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {!product.isAvailable
                    ? "Tidak Tersedia"
                    : isOutOfStock
                    ? "Stok Habis"
                    : `+ Keranjang (${formatPrice(totalPrice)})`}
                </span>
              </button>

              <Link
                href={`/produk/${product.slug}`}
                prefetch={true}
                onClick={onClose}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center gap-1"
              >
                <span>Detail</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
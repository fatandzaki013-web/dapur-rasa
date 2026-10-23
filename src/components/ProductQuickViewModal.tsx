"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Phone,
  Sparkles,
  CheckCircle,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";

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
  const { settings, formatPrice } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0].id : null
  );

  if (!product) return null;

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || null;
  const basePrice = product.price;
  const unitPrice = basePrice + (selectedVariant?.priceAdjustment || 0);
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addItem(product, selectedVariant, quantity);
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
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Photo */}
          <div className="sm:col-span-5 aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {product.category?.name || "Kue & Camilan"}
                </span>
                {product.isAvailable ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Tersedia
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                    Tidak Tersedia
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-heading mt-2">
                {product.name}
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-900 font-mono">
                {formatPrice(unitPrice)}
              </span>
              <span className="text-xs text-stone-500">/ {product.unit}</span>
            </div>

            {/* Variant selector if available */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 block">Pilihan Varian:</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {v.name}
                      {v.priceAdjustment > 0 && ` (+${formatPrice(v.priceAdjustment)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-stone-700">Jumlah:</span>
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1.5 text-xs font-bold font-mono text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white cursor-pointer"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {!product.isAvailable
                    ? "Produk Tidak Tersedia"
                    : isOutOfStock
                    ? "Stok Habis"
                    : `Tambah ke Keranjang (${formatPrice(totalPrice)})`}
                </span>
              </button>

              <Link
                href={`/produk/${product.slug}`}
                prefetch={true}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <span>Halaman Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

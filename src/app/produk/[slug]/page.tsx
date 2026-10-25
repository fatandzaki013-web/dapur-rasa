"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import ProductLikeButton from "@/components/ProductLikeButton";
import {
  ShoppingBag,
  Phone,
  CheckCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  AlertCircle,
  Package,
  Eye,
  X,
} from "lucide-react";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price: number;
  promoPrice?: number | null;
  sku?: string;
  unit: string;
  stock: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNew: boolean;
  ingredients?: string;
  allergens?: string;
  storageGuide?: string;
  shelfLife?: string;
  weightGrams?: number;
  piecesPerPack?: number;
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; alt?: string; isPrimary: boolean }>;
  variants: Array<{ id: string; name: string; priceAdjustment: number; stock: number; isAvailable: boolean }>;
}

// In-memory cache for instant 0ms zero-wait navigation
const productDetailCache = new Map<string, { product: ProductDetail; relatedProducts: any[] }>();

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { settings, formatPrice } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const cached = productDetailCache.get(slug);
  const [product, setProduct] = useState<ProductDetail | null>(cached ? cached.product : null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>(cached ? cached.relatedProducts : []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    cached?.product?.variants?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!productDetailCache.has(slug)) {
      setIsLoading(true);
    }
    fetch(`/api/public/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produk tidak ditemukan.");
        return res.json();
      })
      .then((data) => {
        productDetailCache.set(slug, {
          product: data.product,
          relatedProducts: data.relatedProducts || [],
        });
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariantId((prev) => prev || data.product.variants[0].id);
        }
      })
      .catch((e) => {
        if (!productDetailCache.has(slug)) {
          setError(e.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-stone-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 aspect-square bg-stone-200 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/3" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <AlertCircle className="w-16 h-16 text-amber-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-stone-900 font-heading mb-2">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Kue yang Anda cari mungkin sudah dipindahkan atau dinonaktifkan.
        </p>
        <Link
          href="/produk"
          prefetch={true}
          className="px-6 py-3 bg-theme-primary text-white text-sm font-semibold rounded-xl"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  // Calculate pricing based on selected variant
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || null;
  const basePrice = product.price;
  const unitPrice = basePrice + (selectedVariant?.priceAdjustment || 0);
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const availableStock = selectedVariant ? Math.min(product.stock, selectedVariant.stock) : product.stock;

  const handleAddToCart = () => {
    const res = addItem(product, selectedVariant, quantity);
    showToast(res.message);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  const handleDirectWhatsApp = () => {
    const storeWa = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "6281234567890";
    let formattedWa = storeWa;
    if (formattedWa.startsWith("0")) formattedWa = "62" + formattedWa.slice(1);
    else if (!formattedWa.startsWith("62")) formattedWa = "62" + formattedWa;

    const message = `Halo ${settings?.brandName || "Dapur Rasa"}, saya ingin memesan langsung:

• Produk: *${product.name}*
${selectedVariant ? `• Varian: ${selectedVariant.name}\n` : ""}• Jumlah: ${quantity} ${product.unit}
• Estimasi Total: Rp ${totalPrice.toLocaleString("id-ID")}

Apakah produk ini tersedia untuk dipesan? Terima kasih.`;

    window.open(`https://wa.me/${formattedWa}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const images = product.images && product.images.length > 0 ? product.images : [{ id: "placeholder", url: "", alt: product.name, isPrimary: true }];
  const currentImageUrl = images[selectedImageIndex]?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-fadeIn border border-amber-600/30">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link href="/" prefetch={true} className="hover:text-stone-900 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/produk" prefetch={true} className="hover:text-stone-900 transition-colors">
          Produk
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/produk?category=${product.category.slug}`}
          prefetch={true}
          className="hover:text-stone-900 transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Image: Desain Cantik Seperti Halaman Tentang Kami (Utuh, Jelas & Bisa Diperbesar) */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative rounded-3xl overflow-hidden aspect-square bg-stone-100 shadow-xl border-4 border-white group cursor-zoom-in"
          >
            {currentImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                Foto Produk
              </div>
            )}

            {/* Like Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <ProductLikeButton product={product} size="lg" className="absolute top-4 right-4 z-20" />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {product.isBestSeller && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md">
                  Best Seller
                </span>
              )}
              {product.isAvailable ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md">
                  Tersedia
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md">
                  Tidak Tersedia
                </span>
              )}
            </div>

            {/* Tombol Perbesar Foto di Pojok Kanan Bawah */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-900 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Perbesar Foto</span>
            </button>

            {!product.isAvailable ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg">
                  Tidak Tersedia
                </span>
              </div>
            ) : isOutOfStock ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                <span className="bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg">
                  Stok Habis
                </span>
              </div>
            ) : null}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-amber-700 shadow-md scale-95"
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="inline-block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              {product.category.name}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
              {product.name}
            </h1>
            {product.sku && (
              <span className="text-xs text-stone-400 mt-1 block">SKU: {product.sku}</span>
            )}
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-stone-900 font-heading">
              {formatPrice(unitPrice)}
            </span>
            <span className="text-sm text-stone-500">/{product.unit}</span>
            <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full">
              {!product.isAvailable ? (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Tidak Tersedia</span>
              ) : isOutOfStock ? (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Stok Habis</span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Tersedia ({availableStock} {product.unit})
                </span>
              )}
            </span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Pilih Varian / Rasa:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-700 bg-amber-50/50 shadow-xs ring-1 ring-amber-700"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-stone-900">{variant.name}</div>
                      {variant.priceAdjustment !== 0 && (
                        <div className="text-[11px] text-stone-500">
                          {variant.priceAdjustment > 0 ? `+${formatPrice(variant.priceAdjustment)}` : formatPrice(variant.priceAdjustment)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Jumlah Pesanan:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                  aria-label="Kurangi"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-900 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="p-2.5 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                  aria-label="Tambah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-stone-500">
                Total perkiraan: <strong className="text-stone-900 font-bold text-sm">{formatPrice(totalPrice)}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-md transition-all ${
                isOutOfStock
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white hover:scale-[1.02] cursor-pointer"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {!product.isAvailable
                  ? "Produk Tidak Tersedia"
                  : isOutOfStock
                  ? "Stok Habis"
                  : "Tambah ke Keranjang"}
              </span>
            </button>

            <button
              onClick={handleDirectWhatsApp}
              disabled={!product.isAvailable}
              className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-md transition-all ${
                !product.isAvailable
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] cursor-pointer"
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>{!product.isAvailable ? "Tidak Tersedia" : "Pesan via WhatsApp"}</span>
            </button>
          </div>

          {/* Payment & Delivery Trust Badges */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs text-stone-600">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pilihan Pengantaran &amp; Pembayaran:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-[#4A0E4E] font-bold text-[11px] border border-purple-200">
                Ambil di Dapur (Gratis Ongkir)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                Diantar ke Perum Griya Cileungsi 5
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                Bayar saat Diterima (COD / Tunai)
              </span>
            </div>
          </div>

          {/* Product Specifications & Details Card */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <h3 className="font-heading font-bold text-lg text-stone-900">
              Rincian & Informasi Produk
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              {product.weightGrams && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-stone-500" />
                  <span>Berat: <strong>{product.weightGrams} gram</strong></span>
                </div>
              )}
              {product.piecesPerPack && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-stone-500" />
                  <span>Isi per pack: <strong>{product.piecesPerPack} {product.unit}</strong></span>
                </div>
              )}
              {product.shelfLife && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Masa simpan: <strong>{product.shelfLife}</strong></span>
                </div>
              )}
              {product.allergens && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Alergen: <strong>{product.allergens}</strong></span>
                </div>
              )}
            </div>

            {product.ingredients && (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-amber-900 block">Komposisi Bahan:</span>
                <p className="leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            {product.storageGuide && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block">Saran Penyimpanan & Penyajian:</span>
                <p className="leading-relaxed">{product.storageGuide}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-stone-200">
          <h2 className="text-2xl font-bold font-heading text-stone-900 mb-6">
            Kue Pilihan Lainnya dalam Kategori Ini
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/produk/${rel.slug}`}
                prefetch={true}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="aspect-[4/3] sm:aspect-square bg-stone-100 overflow-hidden relative">
                  {rel.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rel.images[0].url}
                      alt={rel.name}
                      className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      Foto
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-4">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#4A0E4E] transition-colors line-clamp-1 leading-tight">
                    {rel.name}
                  </h4>
                  <div className="text-xs sm:text-base font-extrabold text-[#4A0E4E] mt-1 font-mono leading-none">
                    {formatPrice(rel.promoPrice && rel.promoPrice > 0 ? rel.promoPrice : rel.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Fullscreen Lightbox Zoom Modal */}
      {isLightboxOpen && currentImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

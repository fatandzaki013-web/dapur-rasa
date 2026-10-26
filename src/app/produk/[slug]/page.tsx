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
  ArrowRight,
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

// In-memory cache for instant zero-wait navigation
const productDetailCache = new Map<string, { product: ProductDetail; relatedProducts: any[] }>();

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { settings, formatPrice } = useStore();
  const { addItem, setIsCartOpen, clearCart } = useCart();

  const cached = productDetailCache.get(slug);
  const [product, setProduct] = useState<ProductDetail | null>(cached ? cached.product : null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>(cached ? cached.relatedProducts : []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

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
      <div className="w-full max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-5 bg-stone-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 rounded-3xl aspect-[4/3] bg-stone-200" />
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
        <AlertCircle className="w-14 h-14 text-amber-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-stone-900 font-heading mb-2">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-xs text-stone-500 mb-5">
          Kue yang Anda cari mungkin sudah dipindahkan atau dinonaktifkan.
        </p>
        <Link
          href="/produk"
          prefetch={true}
          className="px-5 py-2.5 bg-[#4A0E4E] text-white text-xs font-semibold rounded-xl"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  // Pricing & Stock
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const availableStock = product.stock;

  const handleAddToCart = () => {
    const res = addItem(product, null, quantity);
    showToast(res.message);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  const handleDirectWhatsApp = () => {
    const storeWa = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "6285888159765";
    let formattedWa = storeWa;
    if (formattedWa.startsWith("0")) formattedWa = "62" + formattedWa.slice(1);
    else if (!formattedWa.startsWith("62")) formattedWa = "62" + formattedWa;

    const brand = settings?.brandName || "Dapur Rasa";
    const message = `Halo ${brand}, saya ingin memesan langsung:

• Produk: *${product.name}*
• Jumlah: ${quantity} ${product.unit}
• Estimasi Total: Rp ${totalPrice.toLocaleString("id-ID")}

Apakah produk ini tersedia untuk dipesan? Terima kasih.`;

    // Kosongkan keranjang agar saat kembali ke web, keranjang belanja langsung bersih
    clearCart();
    try {
      localStorage.removeItem("dr_cart_items_v1");
      localStorage.setItem("dr_cart_items_v1", "[]");
    } catch (e) {}

    window.open(`https://api.whatsapp.com/send?phone=${formattedWa}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const images = product.images && product.images.length > 0 ? product.images : [{ id: "placeholder", url: "", alt: product.name, isPrimary: true }];
  const currentImageUrl = images[0]?.url || "";

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-28 lg:pb-16 min-w-0 overflow-hidden box-border">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-fadeIn border border-amber-600/30">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation - Scrollable horizontal tanpa merusak lebar layar mobile */}
      <nav className="w-full max-w-full flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 mb-3 sm:mb-5 overflow-x-auto whitespace-nowrap scrollbar-none py-1 min-w-0">
        <Link href="/" prefetch={true} className="hover:text-stone-900 transition-colors shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-stone-400" />
        <Link href="/produk" prefetch={true} className="hover:text-stone-900 transition-colors shrink-0">
          Produk
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-stone-400" />
        <Link
          href={`/produk?category=${product.category.slug}`}
          prefetch={true}
          className="hover:text-stone-900 transition-colors shrink-0"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-stone-400" />
        <span
          className="text-stone-900 font-semibold shrink-0 truncate max-w-[140px] sm:max-w-xs"
          title={product.name}
        >
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout: Grid Responsif Tanpa Overflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-start w-full min-w-0">
        {/* Left: Foto Produk Proporsional & Rapi */}
        <div className="lg:col-span-6 w-full min-w-0">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[4/3] max-h-[320px] sm:max-h-[460px] bg-stone-100 shadow-md sm:shadow-xl border-2 sm:border-4 border-white relative group cursor-zoom-in w-full mx-auto"
          >
            {currentImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
                Foto Produk
              </div>
            )}

            {/* Like Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <ProductLikeButton
                product={product}
                size="md"
                className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20"
              />
            </div>

            {/* Badges Status */}
            <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-col gap-1 z-20 pointer-events-none">
              {product.isBestSeller && (
                <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-600 text-white text-[10px] sm:text-xs font-bold shadow-md">
                  Best Seller
                </span>
              )}
              {product.isAvailable ? (
                <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-emerald-600 text-white text-[10px] sm:text-xs font-bold shadow-md">
                  Tersedia
                </span>
              ) : (
                <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-red-600 text-white text-[10px] sm:text-xs font-bold shadow-md">
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
              className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-900 text-white text-[11px] sm:text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Perbesar</span>
            </button>

            {!product.isAvailable ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-20">
                <span className="bg-red-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg">
                  Tidak Tersedia
                </span>
              </div>
            ) : isOutOfStock ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-20">
                <span className="bg-amber-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg">
                  Stok Habis
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Rincian Produk & Tombol Aksi */}
        <div className="lg:col-span-6 space-y-3.5 sm:space-y-5 w-full min-w-0">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#4A0E4E] uppercase tracking-wider block mb-1">
              {product.category.name}
            </span>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-stone-900 font-heading leading-snug break-words">
              {product.name}
            </h1>
            {product.sku && (
              <span className="text-[11px] text-stone-400 mt-0.5 block">SKU: {product.sku}</span>
            )}
          </div>

          {/* Kotak Harga & Status Stok */}
          <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-between gap-2 w-full">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-xl sm:text-3xl font-extrabold text-[#4A0E4E] font-heading truncate">
                {formatPrice(unitPrice)}
              </span>
              <span className="text-xs sm:text-sm text-stone-500 font-medium shrink-0">/{product.unit}</span>
            </div>

            <div className="shrink-0">
              {!product.isAvailable ? (
                <span className="text-[10.5px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                  Tidak Tersedia
                </span>
              ) : isOutOfStock ? (
                <span className="text-[10.5px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Stok Habis
                </span>
              ) : (
                <span className="text-[10.5px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Tersedia ({availableStock} {product.unit})
                </span>
              )}
            </div>
          </div>

          {/* Deskripsi Singkat */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed break-words">
              {product.shortDescription}
            </p>
          )}

          {/* Pilihan Jumlah Pesanan */}
          <div className="space-y-1.5">
            <label className="block text-[11px] sm:text-xs font-bold text-stone-800 uppercase tracking-wider">
              Jumlah Pesanan:
            </label>
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs h-9 sm:h-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 h-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Kurangi kuantitas"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs sm:text-sm font-bold text-stone-900 min-w-7 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="px-3 h-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Tambah kuantitas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-stone-500 text-right sm:text-left">
                <span>Total: </span>
                <strong className="text-stone-900 font-extrabold text-sm sm:text-base text-[#4A0E4E]">
                  {formatPrice(totalPrice)}
                </strong>
              </div>
            </div>
          </div>

          {/* Tombol Aksi di Halaman Utama */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-3 sm:py-3.5 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all ${
                isOutOfStock
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white active:scale-95 cursor-pointer shadow-purple-950/20"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {!product.isAvailable
                  ? "Tidak Tersedia"
                  : isOutOfStock
                  ? "Stok Habis"
                  : "+ Keranjang"}
              </span>
            </button>

            <button
              onClick={handleDirectWhatsApp}
              disabled={!product.isAvailable}
              className={`py-3 sm:py-3.5 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all ${
                !product.isAvailable
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer shadow-emerald-700/20"
              }`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {!product.isAvailable ? "Tidak Tersedia" : "Pesan via WA"}
              </span>
            </button>
          </div>

          {/* Badge Pengantaran & Pembayaran */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pilihan Pengantaran &amp; Pembayaran:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-[#4A0E4E] font-bold text-[10px] sm:text-[11px] border border-purple-200/80">
                Ambil di Dapur (Gratis)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-[10px] sm:text-[11px] border border-amber-200/80">
                Free Ongkir Griya Cileungsi 5
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px] sm:text-[11px] border border-emerald-200/80">
                Bayar di Tempat (COD)
              </span>
            </div>
          </div>

          {/* Rincian & Informasi Lengkap Produk */}
          <div className="pt-4 sm:pt-5 border-t border-stone-200 space-y-3 sm:space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-stone-900">
              Rincian &amp; Informasi Produk
            </h3>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line break-words">
              {product.description}
            </p>

            {/* Spesifikasi Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {product.weightGrams && (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 flex items-center gap-2 text-xs text-stone-700">
                  <Package className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>Berat Bersih: <strong className="text-stone-900 font-bold">{product.weightGrams} gram</strong></span>
                </div>
              )}
              {product.piecesPerPack && (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 flex items-center gap-2 text-xs text-stone-700">
                  <Sparkles className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>Isi Kemasan: <strong className="text-stone-900 font-bold">{product.piecesPerPack} {product.unit}</strong></span>
                </div>
              )}
              {product.shelfLife && (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 flex items-start gap-2 text-xs text-stone-700">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span>Masa Simpan: </span>
                    <strong className="text-stone-900 font-bold block sm:inline">{product.shelfLife}</strong>
                  </div>
                </div>
              )}
              {product.allergens && (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 flex items-start gap-2 text-xs text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span>Informasi Alergen: </span>
                    <strong className="text-stone-900 font-bold block sm:inline">{product.allergens}</strong>
                  </div>
                </div>
              )}
            </div>

            {product.ingredients && (
              <div className="p-3 sm:p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-stone-700 space-y-1 break-words">
                <span className="font-bold text-amber-900 block text-xs">Komposisi Bahan:</span>
                <p className="leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            {product.storageGuide && (
              <div className="p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1 break-words">
                <span className="font-bold text-stone-900 block text-xs">Saran Penyimpanan &amp; Penyajian:</span>
                <p className="leading-relaxed">{product.storageGuide}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produk Rekomendasi Terkait */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-stone-200">
          <h2 className="text-base sm:text-2xl font-bold font-heading text-stone-900 mb-3 sm:mb-6">
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
                <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
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
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#4A0E4E] transition-colors line-clamp-2 leading-tight">
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

      {/* ============================================================== */}
      {/* MOBILE STICKY BOTTOM BAR (TETAP TERLIHAT DI LAYAR HP TANPA TERPOTONG) */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] p-2.5 px-3.5">
        <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
          {/* Info Harga & Kuantitas */}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">
              Total ({quantity} {product.unit}):
            </span>
            <span className="font-extrabold text-sm sm:text-base text-[#4A0E4E] font-heading block truncate">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* Tombol WA & Tambah ke Keranjang */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              disabled={!product.isAvailable}
              className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition active:scale-95 shadow-xs cursor-pointer"
              aria-label="Pesan via WhatsApp"
              title="Pesan via WhatsApp"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer ${
                isOutOfStock
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{isOutOfStock ? "Habis" : "+ Keranjang"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {isLightboxOpen && currentImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="w-full max-w-3xl flex items-center justify-between text-white pb-3 px-2">
            <span className="text-xs sm:text-sm font-bold truncate pr-4">{product.name}</span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition shrink-0"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
          <p className="text-white/60 text-[10px] sm:text-xs mt-3 text-center">
            Sentuh / cubit layar untuk memperbesar tampilan foto kue
          </p>
        </div>
      )}
    </div>
  );
}

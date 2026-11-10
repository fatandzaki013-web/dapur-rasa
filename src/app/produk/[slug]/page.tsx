"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import ProductLikeButton from "@/components/ProductLikeButton";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppApiUrl } from "@/lib/whatsapp";
import {
  ShoppingBag,
  Truck,
  Phone,
  CheckCircle,
  ShieldCheck,
  Clock,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  AlertCircle,
  Package,
  Eye,
  X,
  ArrowRight,
  Share2,
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

    const loadDetail = async () => {
      try {
        const { data, error: supaErr } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if (data && !supaErr) {
          const detail: ProductDetail = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            shortDescription: data.description || "",
            price: data.price,
            promoPrice: null,
            unit: data.unit || "pcs",
            stock: data.is_available ? 50 : 0,
            isAvailable: data.is_available,
            isBestSeller: data.badge?.toLowerCase().includes("favorit") || false,
            isFeatured: true,
            isNew: false,
            category: {
              id: (data.category || "kue").toLowerCase(),
              name: data.category || "Kue",
              slug: (data.category || "kue").toLowerCase().replace(/\s+/g, "-"),
            },
            images: [
              {
                id: "img-1",
                url: data.image_url,
                alt: data.name,
                isPrimary: true,
              },
            ],
            variants: [],
          };

          setProduct(detail);

          const { data: relData } = await supabase
            .from("products")
            .select("*")
            .neq("slug", slug)
            .limit(4);

          const rel = (relData || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            price: r.price,
            unit: r.unit || "pcs",
            images: [{ url: r.image_url, isPrimary: true }],
            category: { name: r.category, slug: (r.category || "").toLowerCase() },
          }));

          setRelatedProducts(rel);
          productDetailCache.set(slug, {
            product: detail,
            relatedProducts: rel,
          });
          setIsLoading(false);
          return;
        }

        // Fallback ke API internal
        const res = await fetch(`/api/public/products/${slug}`);
        if (!res.ok) throw new Error("Produk tidak ditemukan.");
        const apiData = await res.json();
        productDetailCache.set(slug, {
          product: apiData.product,
          relatedProducts: apiData.relatedProducts || [],
        });
        setProduct(apiData.product);
        setRelatedProducts(apiData.relatedProducts || []);
      } catch (e: any) {
        if (!productDetailCache.has(slug)) {
          setError(e.message || "Gagal memuat produk.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
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
          <div style={{ aspectRatio: "4 / 3" }} className="lg:col-span-6 rounded-3xl aspect-[4/3] aspect-4/3 bg-stone-200" />
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
          className="px-5 py-2.5 bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-semibold rounded-xl"
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

    const waUrl = buildWhatsAppApiUrl(message, settings?.whatsappNumber);
    window.open(waUrl, "_blank");
  };

  const images = product.images && product.images.length > 0 ? product.images : [{ id: "placeholder", url: "", alt: product.name, isPrimary: true }];
  const currentImageUrl = images[0]?.url || "";

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-24 md:pt-36 pb-36 min-w-0 box-border">
      {/* Toast Notification (Floating Pill Toast) */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 bg-[#123829] text-white px-5 py-2.5 rounded-full shadow-floating text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn border border-[#47C98E]">
          <CheckCircle className="w-4 h-4 text-[#47C98E] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation - Ringkas & Bersih */}
      <nav className="w-full max-w-full flex items-center gap-1.5 text-[11px] sm:text-xs text-[#687871] mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1 min-w-0">
        <Link href="/" prefetch={true} className="hover:text-[#111915] transition-colors shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-[#687871]/60" />
        <Link href="/produk" prefetch={true} className="hover:text-[#111915] transition-colors shrink-0">
          Produk
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-[#687871]/60" />
        <Link
          href={`/produk?category=${product.category.slug}`}
          prefetch={true}
          className="hover:text-[#111915] transition-colors shrink-0"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-[#687871]/60" />
        <span className="text-[#111915] font-semibold shrink-0 truncate max-w-[160px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* ============================================================== */}
      {/* STEPPED ASYMMETRIC DETAIL SHEET (EMERALD & SOFT MINT SPEC) */}
      {/* ============================================================== */}
      <div className="w-full rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#D5EADF] shadow-card bg-white">
        {/* Kanvas Showcase Atas: Pastel Card Tint dengan Motif Halftone Dot Matrix */}
        <div
          className="bg-[#E8F5EE] pt-5 px-5 sm:px-8 pb-0 relative overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in srgb, #123829 14%, transparent) 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
          }}
        >
          {/* Overlay Navigation Bar (Mode 3: Header Halaman Detail) */}
          <div className="flex items-center justify-between relative z-20 mb-3">
            <Link
              href="/produk"
              prefetch={true}
              className="w-10 h-10 rounded-[12px] bg-white text-[#111915] shadow-card flex items-center justify-center hover:bg-[#F4F7F5] transition active:scale-95 cursor-pointer"
              aria-label="Kembali ke katalog"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5 text-[#111915]" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-[12px] bg-white shadow-card flex items-center justify-center">
                <ProductLikeButton product={product} size="sm" variant="minimal" />
              </div>
            </div>
          </div>

          {/* Judul & Kategori Header */}
          <div className="relative z-20 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#2E9E6B] uppercase tracking-wider">
                {product.category.name}
              </span>
              {product.isBestSeller && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#2E9E6B] text-white text-[10px] font-bold uppercase shadow-2xs">
                  Favorit Pelanggan
                </span>
              )}
              {product.isAvailable ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#123829] text-white text-[10px] font-bold uppercase shadow-2xs">
                  Tersedia
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase shadow-2xs">
                  Habis
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111915] font-heading leading-tight break-words">
              {product.name}
            </h1>
            {product.sku && (
              <span className="text-[11px] text-[#687871] mt-0.5 block">SKU: {product.sku}</span>
            )}
          </div>

          {/* Visual Utama Produk (Center / Right Showcase) */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="w-full max-w-sm sm:max-w-md mx-auto my-4 sm:my-6 relative flex items-center justify-center group cursor-zoom-in"
          >
            <div className="w-full h-[200px] sm:h-[260px] rounded-[22px] overflow-hidden bg-white/60 backdrop-blur-xs border border-white/80 shadow-md flex items-center justify-center relative">
              {currentImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-[#687871] text-xs">Foto Produk</div>
              )}

              {/* Tombol Perbesar Foto */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-[#111915]/85 hover:bg-[#111915] text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#47C98E] shrink-0" />
                <span>Perbesar</span>
              </button>
            </div>
          </div>

          {/* Tab Harga Asimetris (Stepped Callout Menjorok ke Sudut Kiri Bawah) */}
          <div className="flex items-end justify-between relative z-10">
            <div className="bg-white rounded-tr-[24px] pt-3.5 pr-6 sm:pr-8 pb-2 pl-4 sm:pl-6 inline-flex flex-col border-t border-r border-[#D5EADF]/70 -mb-[1px] shadow-xs">
              <span className="text-[10px] sm:text-xs text-[#687871] font-bold uppercase tracking-wider block">
                Harga / Price
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2E9E6B] font-mono leading-none">
                  {formatPrice(unitPrice)}
                </span>
                <span className="text-xs sm:text-sm text-[#687871] font-medium">/{product.unit}</span>
              </div>
            </div>

            <div className="pb-3 pr-2 hidden sm:block text-right">
              <span className="text-xs text-[#687871] font-medium block">
                {product.isAvailable ? `Stok: ${availableStock} ${product.unit}` : "Stok Tidak Tersedia"}
              </span>
            </div>
          </div>
        </div>

        {/* Lembar Detail Putih (White Detail Sheet) */}
        <div className="bg-white p-5 sm:p-8 space-y-6 sm:space-y-7">
          {/* Baris Deskripsi */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#111915] font-heading">
              Deskripsi
            </h2>
            <p className="text-xs sm:text-sm text-[#687871] leading-relaxed whitespace-pre-line break-words">
              {product.description || product.shortDescription || "Kue lezat berkualitas tinggi buatan rumahan higienis dengan resep istimewa."}
            </p>
          </div>

          {/* Pengatur Kuantitas Manual (- 1 +) & Total (Liquid Glass) */}
          <div className="space-y-2 pt-2 border-t border-[#D5EADF]/60">
            <div className="flex items-center justify-between gap-3 w-full">
              <div>
                <span className="block text-xs font-bold text-[#111915] uppercase tracking-wider">
                  Jumlah Pesanan
                </span>
                <span className="text-[11px] text-[#687871]">Sesuaikan kuantitas</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-[16px] liquid-glass overflow-hidden h-11 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full hover:bg-white/80 text-[#123829] transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Kurangi kuantitas"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-xs sm:text-sm font-extrabold text-[#111915] text-center font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="w-10 h-full hover:bg-white/80 text-[#123829] transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Tambah kuantitas"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#687871] block">Total:</span>
                  <span className="text-sm sm:text-base font-extrabold text-[#123829] font-mono leading-none">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Langsung di Body Desktop */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`h-[48px] px-5 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-card transition-all ${
                isOutOfStock
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#123829] hover:bg-[#1A4D39] text-white active:scale-95 cursor-pointer"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#47C98E] shrink-0" />
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
              className={`h-[48px] px-5 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-card transition-all ${
                !product.isAvailable
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#2E9E6B] hover:bg-[#258257] text-white active:scale-95 cursor-pointer"
              }`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {!product.isAvailable ? "Tidak Tersedia" : "Pesan via WA"}
              </span>
            </button>
          </div>

          {/* Pengantaran & Pembayaran */}
          <div className="py-3 px-4 rounded-[18px] bg-[#F4F7F5] border border-[#D5EADF] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#111915]">
            <div className="flex items-center gap-2 text-[#123829] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2E9E6B] shrink-0" />
              <span>Ambil di Dapur Toko / Bayar di Tempat (COD)</span>
            </div>
            <div className="flex items-center gap-2 text-[#123829] font-semibold">
              <Truck className="w-4 h-4 text-[#2E9E6B] shrink-0" />
              <span>Free Ongkir Area Griya Cileungsi 5</span>
            </div>
          </div>

          {/* Rincian Spesifikasi Produk Lengkap */}
          <div className="pt-2 border-t border-[#D5EADF]/60 space-y-3">
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#111915]">
              Spesifikasi &amp; Informasi Produk
            </h3>

            <div className="divide-y divide-[#D5EADF]/50 text-xs text-[#111915]">
              {product.weightGrams && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#687871] flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#2E9E6B]" />
                    <span>Berat Bersih</span>
                  </span>
                  <span className="font-semibold">{product.weightGrams} gram</span>
                </div>
              )}
              {product.piecesPerPack && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#687871] flex items-center gap-2">
                    <PackageCheck className="w-3.5 h-3.5 text-[#2E9E6B]" />
                    <span>Isi Kemasan</span>
                  </span>
                  <span className="font-semibold">{product.piecesPerPack} {product.unit}</span>
                </div>
              )}
              {product.shelfLife && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#687871] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#2E9E6B]" />
                    <span>Masa Simpan</span>
                  </span>
                  <span className="font-semibold text-right">{product.shelfLife}</span>
                </div>
              )}
              {product.allergens && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#687871] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E6B]" />
                    <span>Informasi Alergen</span>
                  </span>
                  <span className="font-semibold text-right">{product.allergens}</span>
                </div>
              )}
            </div>

            {product.ingredients && (
              <div className="pt-2 text-xs space-y-1">
                <span className="font-bold text-[#111915] block">Komposisi Bahan:</span>
                <p className="leading-relaxed text-[#687871]">{product.ingredients}</p>
              </div>
            )}

            {product.storageGuide && (
              <div className="pt-2 text-xs space-y-1">
                <span className="font-bold text-[#111915] block">Saran Penyimpanan &amp; Penyajian:</span>
                <p className="leading-relaxed text-[#687871]">{product.storageGuide}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRODUK REKOMENDASI TERKAIT (TOP PICKS STYLE CARDS) */}
      {/* ============================================================== */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#D5EADF]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-xl font-extrabold font-heading text-[#111915]">
              Kue Pilihan Lainnya
            </h2>
            <Link
              href="/produk"
              prefetch={true}
              className="text-xs sm:text-sm font-bold text-[#2E9E6B] hover:text-[#123829] transition-colors"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/produk/${rel.slug}`}
                prefetch={true}
                className="group bg-[#E8F5EE] rounded-[22px] border border-[#D5EADF] p-3 shadow-2xs hover:shadow-card hover:border-[#47C98E] transition-all flex flex-col justify-between"
              >
                <div className="w-full h-[120px] rounded-[16px] overflow-hidden bg-white relative shrink-0">
                  {rel.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rel.images[0].url}
                      alt={rel.name}
                      className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#687871] text-xs">
                      Foto
                    </div>
                  )}
                </div>

                <div className="pt-2.5 flex flex-col justify-between flex-1">
                  <h4 className="font-extrabold text-[#111915] text-xs sm:text-sm group-hover:text-[#123829] transition-colors line-clamp-1 leading-snug">
                    {rel.name}
                  </h4>
                  <div className="text-xs sm:text-sm font-extrabold text-[#2E9E6B] mt-1 font-mono leading-none">
                    {formatPrice(rel.promoPrice && rel.promoPrice > 0 ? rel.promoPrice : rel.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MOBILE & TABLET STICKY BOTTOM ACTION BAR (Liquid Glass System) */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 liquid-glass-track border-t border-white/80 shadow-[0_-6px_30px_rgba(18,56,41,0.14)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Squircle Tombol WhatsApp (Liquid Glass Mint) */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            disabled={!product.isAvailable}
            className="w-[50px] h-[50px] rounded-[16px] liquid-glass-mint flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer shrink-0"
            aria-label="Pesan via WhatsApp"
            title="Pesan via WhatsApp"
          >
            <Phone className="w-5 h-5 text-[#123829]" />
          </button>

          {/* CTA Pill Penuh (+ Keranjang & Total Harga) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-[50px] rounded-full font-bold text-xs sm:text-sm flex items-center justify-between px-5 sm:px-6 shadow-floating transition active:scale-95 cursor-pointer liquid-glass-shine ${
              isOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed justify-center"
                : "liquid-glass-active text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 shrink-0 text-[#47C98E]" />
              <span>{isOutOfStock ? "Stok Habis" : "+ Keranjang"}</span>
            </div>
            {!isOutOfStock && (
              <span className="font-extrabold text-white font-mono text-sm">
                {formatPrice(totalPrice)}
              </span>
            )}
          </button>
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
            Sentuh atau cubit layar untuk memperbesar foto kue
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import {
  Search,
  Filter,
  ShoppingBag,
  CheckCircle,
  SlidersHorizontal,
  X,
  Eye,
  UtensilsCrossed,
} from "lucide-react";
import ProductQuickViewModal, { QuickViewProduct } from "@/components/ProductQuickViewModal";
import ProductLikeButton from "@/components/ProductLikeButton";
import { DEFAULT_PRODUCTS, ProductItem as Product } from "@/lib/constants";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const { categories, formatPrice } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState("order");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync searchTerm when URL query changes from Navbar
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchTerm(q);
    }
    const cat = searchParams.get("category");
    if (cat !== null) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const [, startTransition] = useTransition();

  // Fetch products based on filters
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortOption !== "order") params.set("sort", sortOption);
    if (onlyAvailable) params.set("available", "true");

    fetch(`/api/public/products?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((e) => console.error("Error fetching products:", e))
      .finally(() => setIsLoading(false));
  }, [searchTerm, selectedCategory, sortOption, onlyAvailable]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (product: Product) => {
    const res = addItem(product, null, 1);
    showToast(res.message);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  const handleCategorySelect = (slug: string) => {
    startTransition(() => {
      setSelectedCategory((prev) => (prev === slug ? "" : slug));
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn border border-amber-600/30">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddedToCart={(msg) => showToast(msg)}
      />

      {/* Header Halaman */}
      <div className="mb-8">
        <span className="text-xs font-bold tracking-wider uppercase text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5 mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Katalog Lengkap
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
          Aneka Kue & Camilan Lezat
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Pilih kue favorit Anda untuk camilan harian, acara keluarga, rapat kantor, atau stok frozen food.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kue (pastel, risol, brownies, sosis solo...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Availability Selectors */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="order">Urutan Rekomendasi</option>
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="newest">Produk Terbaru</option>
              <option value="name-asc">Nama: A - Z</option>
            </select>

            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                onlyAvailable
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {onlyAvailable ? "✓ Hanya Yang Tersedia" : "Tampilkan Semua"}
            </button>
          </div>
        </div>

        {/* Active Search & Filter Feedback Banner */}
        {searchTerm && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-[#4A0E4E]">
            <span className="flex items-center gap-1.5 truncate">
              <Search className="w-4 h-4 text-[#4A0E4E] shrink-0" />
              <span className="truncate">
                Hasil pencarian untuk: <strong>&ldquo;{searchTerm}&rdquo;</strong> ({products.length} produk ditemukan)
              </span>
            </span>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-[#4A0E4E] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-stone-100">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === ""
                ? "bg-[#4A0E4E] text-white shadow-xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#4A0E4E] text-white shadow-xs"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Produk Responsif (2 Kolom di HP / Mobile) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200 animate-pulse space-y-3">
              <div className="aspect-square bg-stone-200 rounded-2xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="pt-3 flex justify-between items-center">
                <div className="h-5 bg-stone-200 rounded w-1/2" />
                <div className="w-8 h-8 bg-stone-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-stone-200">
          <div className="w-16 h-16 bg-purple-50 text-[#4A0E4E] rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-stone-900 font-bold text-lg font-heading mb-1">
            Tidak ada produk yang ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
            Coba gunakan kata kunci pencarian yang berbeda atau hapus filter kategori yang sedang aktif.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setOnlyAvailable(false);
            }}
            className="px-5 py-2.5 bg-[#4A0E4E] text-white text-xs font-semibold rounded-xl hover:bg-[#5C1261] cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((prod) => {
            const currentPrice = prod.price;
            const isOutOfStock = !prod.isAvailable || prod.stock <= 0;
            const primaryImg =
              prod.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80";

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col group justify-between"
              >
                {/* Product Image */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <Link href={`/produk/${prod.slug}`} prefetch={true}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImg}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                  </Link>

                  {/* Tombol Like di atas gambar produk */}
                  <ProductLikeButton product={prod} className="absolute top-3 right-3 z-10" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {prod.isAvailable ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                        Tersedia
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold shadow-md">
                        Tidak Tersedia
                      </span>
                    )}
                    {prod.isBestSeller && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold shadow-md">
                        Best Seller
                      </span>
                    )}
                    {prod.isNew && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-md">
                        Baru
                      </span>
                    )}
                  </div>

                  {/* Quick View Button on Hover */}
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(prod as any)}
                    className="absolute inset-x-3 bottom-3 py-2 bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lihat Cepat (Quick View)</span>
                  </button>

                  {!prod.isAvailable ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                      <span className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                        Tidak Tersedia
                      </span>
                    </div>
                  ) : prod.stock <= 0 ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                      <span className="bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                        Stok Habis
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div>
                    <div className="text-[10px] sm:text-[11px] text-[#4A0E4E] font-bold mb-0.5">
                      {prod.category?.name}
                    </div>
                    <Link
                      href={`/produk/${prod.slug}`}
                      prefetch={true}
                      className="font-heading font-bold text-stone-900 text-xs sm:text-base hover:text-[#4A0E4E] transition-colors line-clamp-1 block"
                    >
                      {prod.name}
                    </Link>
                    <p className="text-[11px] text-stone-500 line-clamp-1 sm:line-clamp-2 mt-0.5 hidden xs:block">
                      {prod.shortDescription || "Kue rumahan berkualitas tanpa pengawet buatan."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-base font-extrabold text-[#4A0E4E] font-mono">
                        {formatPrice(currentPrice)}
                        <span className="text-[10px] sm:text-xs font-normal text-stone-500 ml-0.5">
                          /{prod.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(prod)}
                      disabled={isOutOfStock}
                      className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center ${
                        isOutOfStock
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                          : "bg-[#4A0E4E] hover:bg-[#5C1261] text-white shadow-md hover:scale-105 cursor-pointer active:scale-90"
                      }`}
                      title={!prod.isAvailable ? "Produk Tidak Tersedia" : prod.stock <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-stone-500">Memuat katalog kue...</div>}>
      <ProductsContent />
    </React.Suspense>
  );
}

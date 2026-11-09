"use client";


import React, { useEffect, useState, useTransition, useMemo } from "react";
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
import { Product, fetchProductsFromSupabase } from "@/lib/supabase";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const { categories, formatPrice } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load all products from Supabase
  useEffect(() => {
    setIsLoading(true);
    fetchProductsFromSupabase()
      .then((data) => {
        setAllProducts(data || []);
      })
      .catch((e) => console.error("Error fetching products from Supabase:", e))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter instan di sisi klien/state (Real-time tanpa jeda)
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Filter Kategori Aktif (jika dipilih)
    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        if (catLower === "kue") {
          return (
            pCat.includes("kue") ||
            pCat.includes("pastel") ||
            pCat.includes("risol") ||
            pCat.includes("sosis") ||
            pCat.includes("brownies") ||
            pCat.includes("bolu")
          );
        }
        if (catLower === "nasi") {
          return pCat.includes("nasi");
        }
        if (catLower === "frozen-food" || catLower === "frozen") {
          return pCat.includes("frozen");
        }
        if (catLower === "snack-box" || catLower === "snack") {
          return pCat.includes("snack") || pCat.includes("box");
        }
        return pCat === catLower;
      });
    }

    // 2. Filter Ketersediaan
    if (onlyAvailable) {
      list = list.filter((p) => p.is_available || p.isAvailable);
    }

    // 3. Filter Pencarian Instan (Real-time nama produk & deskripsi)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        const matchCat = (p.category || "").toLowerCase().includes(q);
        return matchName || matchDesc || matchCat;
      });
    }

    // 4. Sorting
    if (sortOption === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allProducts, selectedCategory, onlyAvailable, searchTerm, sortOption]);

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
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-32 sm:pb-16 w-full max-w-full overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn border border-[#2E9E6B]">
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
        <span className="text-xs font-bold tracking-wider uppercase text-[#123829] bg-[#E8F5EE] px-3.5 py-1 rounded-full border border-[#D5EADF] inline-flex items-center gap-1.5 mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5 text-[#2E9E6B]" />
          Katalog Lengkap
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111915] font-heading">
          Aneka Kue &amp; Camilan Lezat
        </h1>
        <p className="text-xs sm:text-sm text-[#687871] mt-1 max-w-2xl">
          Pilih kue favorit Anda untuk camilan harian, acara keluarga, rapat kantor, atau stok frozen food.
        </p>
      </div>

      {/* Filter & Search Bar (Liquid Glass Container) */}
      <div className="liquid-glass-card rounded-[26px] p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#687871] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kue (pastel, risol, brownies, sosis solo...)"
              className="w-full pl-10 pr-10 h-12 rounded-[16px] border border-[#D5EADF] liquid-glass text-xs sm:text-sm text-[#111915] focus:outline-none focus:border-[#123829] focus:bg-white transition-all"
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

          {/* Sort & Availability Selectors (Liquid Glass) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-11 px-3.5 rounded-[14px] liquid-glass text-xs font-semibold text-[#111915] focus:outline-none focus:border-[#123829] cursor-pointer"
            >
              <option value="order">Urutan Rekomendasi</option>
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="newest">Produk Terbaru</option>
              <option value="name-asc">Nama: A - Z</option>
            </select>

            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`h-11 px-4 rounded-[14px] text-xs font-semibold transition-all cursor-pointer liquid-glass-shine ${
                onlyAvailable
                  ? "liquid-glass-mint text-[#123829] font-bold shadow-xs"
                  : "liquid-glass text-[#687871] hover:text-[#111915]"
              }`}
            >
              {onlyAvailable ? "✓ Hanya Yang Tersedia" : "Tampilkan Semua"}
            </button>
          </div>
        </div>

        {/* Active Search & Filter Feedback Banner */}
        {searchTerm && (
          <div className="flex items-center justify-between p-3 liquid-glass-mint rounded-2xl text-xs text-[#123829] animate-fadeIn">
            <span className="flex items-center gap-1.5 truncate">
              <Search className="w-4 h-4 text-[#2E9E6B] shrink-0" />
              <span className="truncate">
                Hasil pencarian untuk: <strong>&ldquo;{searchTerm}&rdquo;</strong> ({filteredProducts.length} menu ditemukan)
              </span>
            </span>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-[#123829] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        )}

        {/* Categories Pills (Liquid Glass Fitur Pilihan) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[#D5EADF]/60">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer liquid-glass-shine active:scale-95 ${
              selectedCategory === ""
                ? "liquid-glass-active shadow-md"
                : "liquid-glass text-[#111915] hover:text-[#123829]"
            }`}
          >
            {selectedCategory === "" ? `Semua Menu (${filteredProducts.length})` : "Semua Menu"}
          </button>
          {[
            { id: "cat-nasi", name: "Nasi Box & Tumpeng", slug: "nasi" },
            { id: "cat-kue", name: "Kue Basah & Brownies", slug: "kue" },
            { id: "cat-frozen", name: "Frozen Food", slug: "frozen-food" },
            { id: "cat-snack", name: "Paket Snack Box", slug: "snack-box" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer liquid-glass-shine active:scale-95 ${
                  isSelected
                    ? "liquid-glass-active shadow-md"
                    : "liquid-glass text-[#111915] hover:text-[#123829]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Produk Responsif (Persis Galeri: Foto Utuh, Judul Lengkap, Tombol + Keranjang Jelas) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="min-w-0 bg-white rounded-2xl p-2.5 sm:p-3.5 border border-stone-200 animate-pulse space-y-2">
              <div className="aspect-square bg-stone-200 rounded-xl" />
              <div className="h-3.5 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#D5EADF] shadow-sm max-w-lg mx-auto my-6 animate-fadeIn">
          <div className="w-16 h-16 bg-[#E8F5EE] text-[#123829] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Search className="w-8 h-8 text-[#2E9E6B]" />
          </div>
          <h3 className="text-stone-900 font-extrabold text-lg sm:text-xl font-heading mb-1.5">
            Menu Tidak Ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-[#687871] max-w-md mx-auto mb-6 leading-relaxed">
            Menu yang Anda cari tidak ditemukan. Coba kata kunci lain atau lihat kategori lainnya.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-[#F2F7F4] hover:bg-[#E8F5EE] text-[#111915] text-xs font-bold rounded-xl transition border border-[#D5EADF] cursor-pointer"
              >
                Hapus Pencarian (&ldquo;{searchTerm}&rdquo;)
              </button>
            )}
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="px-4 py-2 bg-[#123829] hover:bg-[#1A4D39] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Lihat Semua Kategori
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-full">
          {filteredProducts.map((prod: Product) => {
            const currentPrice = prod.price;
            const isOutOfStock = !prod.is_available && !prod.isAvailable;
            const primaryImg =
              prod.image_url ||
              prod.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80";
            const categoryDisplay =
              typeof prod.category === "string"
                ? prod.category
                : (prod.category as any)?.name || "Kue";

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col min-w-0 w-full overflow-hidden bg-[#E8F5EE] rounded-[22px] border border-[#D5EADF] shadow-2xs hover:shadow-card hover:border-[#47C98E] hover:-translate-y-0.5 transition-all duration-300 p-3 sm:p-3.5 justify-between gap-2.5"
              >
                {/* Product Image: height 130px sm:155px, rounded 16px, object-cover */}
                <div className="relative w-full h-[130px] sm:h-[155px] rounded-[16px] overflow-hidden bg-white shrink-0">
                  <Link href={`/produk/${prod.slug}`} prefetch={true} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImg}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-300 sm:group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80"; }}
                    />
                  </Link>

                  {/* Tombol Wishlist Bulat 32px di kiri atas */}
                  <div className="absolute top-2 left-2 z-10">
                    <ProductLikeButton product={prod} size="sm" />
                  </div>

                  {/* Status Badge Kapsul di kanan atas */}
                  <div className="absolute top-2 right-2 z-10 pointer-events-none">
                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-600/90 text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-2xs">
                        Habis
                      </span>
                    ) : prod.isBestSeller ? (
                      <span className="rounded-full bg-[#2E9E6B] text-white px-2 py-0.5 text-[9px] font-bold uppercase shadow-2xs">
                        Favorit
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Info Card */}
                <div className="flex-1 flex flex-col justify-between min-w-0 gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] text-[#2E9E6B] font-bold uppercase tracking-wider truncate block">
                      {categoryDisplay}
                    </span>
                    <Link
                      href={`/produk/${prod.slug}`}
                      prefetch={true}
                      className="font-extrabold text-[#111915] text-xs sm:text-sm hover:text-[#123829] transition-colors line-clamp-1 block leading-snug mt-0.5"
                    >
                      {prod.name}
                    </Link>
                  </div>

                  {/* Bottom Row: Price on left, Round + Action Button on right */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D5EADF]/60 mt-auto min-w-0">
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs sm:text-base font-extrabold text-[#2E9E6B] font-mono leading-none truncate">
                        {formatPrice(currentPrice)}
                      </span>
                      <span className="text-[9px] text-[#687871] font-medium leading-none mt-0.5">/{prod.unit}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleQuickAdd(prod)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-90 cursor-pointer ${
                        isOutOfStock
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#123829] hover:bg-[#1A4D39] text-white"
                      }`}
                      title={isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
                      aria-label={isOutOfStock ? "Stok Habis" : `Tambah ${prod.name} ke Keranjang`}
                    >
                      <ShoppingBag className="w-4 h-4" />
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

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Tag,
  Check,
  X,
  Loader2,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { z } from "zod";
import { supabase, Product } from "@/lib/supabase";

// ==========================================
// 1. ZOD VALIDATION SCHEMA
// ==========================================
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama produk minimal 3 karakter"),
  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib dipilih"),
  price: z.coerce
    .number()
    .positive("Harga harus angka positif (lebih dari 0)"),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi (misal: pcs, box)"),
  image_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
      { message: "URL gambar harus diawali dengan http://, https://, atau /" }
    ),
  badge: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_available: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const CATEGORY_OPTIONS = [
  "Nasi",
  "Pastel",
  "Risol",
  "Sosis Solo",
  "Brownies",
  "Snack Box",
  "Kue Basah",
  "Frozen Food",
];

const UNIT_OPTIONS = ["pcs", "box", "loyang", "porsi", "pack", "mika", "lusin"];

const BADGE_PRESETS = ["Favorit", "Best Seller", "Promo", "Baru", "Rekomendasi"];

// Helper untuk format rupiah
function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper untuk slug URL
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "AVAILABLE" | "UNAVAILABLE">("ALL");

  // Modal State: Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Nasi");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formPrice, setFormPrice] = useState<string>("25000");
  const [formUnit, setFormUnit] = useState("pcs");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal State: Delete Confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // ==========================================
  // FETCH PRODUCTS DARI SUPABASE
  // ==========================================
  const loadProducts = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error("Gagal memuat produk Supabase:", err);
      showToast(err.message || "Gagal menarik data produk dari Supabase.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search by name or description
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term);

      // Category filter
      const matchCategory =
        categoryFilter === "ALL" ||
        p.category.toLowerCase() === categoryFilter.toLowerCase();

      // Availability filter
      const matchAvailability =
        availabilityFilter === "ALL" ||
        (availabilityFilter === "AVAILABLE" && p.is_available) ||
        (availabilityFilter === "UNAVAILABLE" && !p.is_available);

      return matchSearch && matchCategory && matchAvailability;
    });
  }, [products, searchTerm, categoryFilter, availabilityFilter]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.is_available).length;
    const unavailable = total - available;
    const categoriesSet = new Set(products.map((p) => p.category));
    return {
      total,
      available,
      unavailable,
      categoriesCount: categoriesSet.size,
    };
  }, [products]);

  // ==========================================
  // MODAL OPENERS
  // ==========================================
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Nasi");
    setFormCustomCategory("");
    setFormPrice("25000");
    setFormUnit("box");
    setFormImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80");
    setFormBadge("Favorit");
    setFormDescription("");
    setFormIsAvailable(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name || "");
    const isPresetCat = CATEGORY_OPTIONS.includes(product.category);
    setFormCategory(isPresetCat ? product.category : "Lainnya");
    setFormCustomCategory(isPresetCat ? "" : product.category);
    setFormPrice(String(product.price || 0));
    setFormUnit(product.unit || "pcs");
    setFormImageUrl(product.image_url || "");
    setFormBadge(product.badge || "");
    setFormDescription(product.description || "");
    setFormIsAvailable(product.is_available ?? true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
  };

  // ==========================================
  // TOGGLE AVAILABILITY LANGSUNG DI TABEL
  // ==========================================
  const handleToggleAvailability = async (product: Product) => {
    const nextStatus = !product.is_available;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_available: nextStatus } : p))
    );

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: nextStatus })
        .eq("id", product.id);

      if (error) {
        throw error;
      }

      showToast(
        `Status "${product.name}" diubah ke ${nextStatus ? "Tersedia" : "Habis"}.`,
        "success"
      );
    } catch (err: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: !nextStatus } : p))
      );
      showToast(err.message || "Gagal memperbarui status produk di Supabase.", "error");
    }
  };

  // ==========================================
  // SAVE PRODUCT (TAMBAH / EDIT DENGAN ZOD)
  // ==========================================
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const actualCategory =
      formCategory === "Lainnya" && formCustomCategory.trim()
        ? formCustomCategory.trim()
        : formCategory;

    const rawData = {
      name: formName,
      category: actualCategory,
      price: formPrice,
      unit: formUnit,
      image_url: formImageUrl,
      badge: formBadge,
      description: formDescription,
      is_available: formIsAvailable,
    };

    // Validasi input dengan Zod
    const validationResult = productFormSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        errors[fieldName] = issue.message;
      });
      setFormErrors(errors);
      showToast("Periksa kembali input form yang ditandai merah.", "error");
      return;
    }

    const validData = validationResult.data;
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // Mode Edit Produk
        const updatePayload: any = {
          name: validData.name,
          category: validData.category,
          price: validData.price,
          unit: validData.unit,
          image_url: validData.image_url || null,
          badge: validData.badge || null,
          description: validData.description || null,
          is_available: validData.is_available,
        };

        const { error } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", editingProduct.id);

        if (error) throw error;

        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...updatePayload,
                }
              : p
          )
        );

        showToast(`Produk "${validData.name}" berhasil diperbarui!`, "success");
        closeModal();
      } else {
        // Mode Tambah Produk Baru
        const baseSlug = slugify(validData.name);
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const newRow = {
          name: validData.name,
          slug: uniqueSlug,
          category: validData.category,
          price: validData.price,
          unit: validData.unit,
          image_url: validData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
          badge: validData.badge || null,
          description: validData.description || null,
          is_available: validData.is_available,
        };

        const { data, error } = await supabase
          .from("products")
          .insert([newRow])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setProducts((prev) => [data[0], ...prev]);
        } else {
          await loadProducts();
        }

        showToast(`Produk "${validData.name}" berhasil ditambahkan ke katalog!`, "success");
        closeModal();
      }
    } catch (err: any) {
      console.error("Gagal menyimpan produk:", err);
      showToast(err.message || "Gagal menyimpan data ke Supabase.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // HAPUS PRODUK DARI SUPABASE
  // ==========================================
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(`Produk "${productToDelete.name}" berhasil dihapus dari Supabase.`, "success");
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Gagal menghapus produk:", err);
      showToast(err.message || "Gagal menghapus produk dari database.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ============================================================== */}
      {/* FLOATING TOAST NOTIFICATION                                   */}
      {/* ============================================================== */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700/60"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700/60"
                : "bg-slate-900 text-white border-slate-700"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HEADER SECTION                                                */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#4A0E4E] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Dinamis Supabase</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Kelola Menu &amp; Produk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tambah, perbarui harga, foto, kategori, dan ketersediaan menu secara langsung ke database Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Muat ulang data dari Supabase"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A0E4E] hover:bg-[#3D0840] text-white text-xs font-bold shadow-md shadow-[#4A0E4E]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-200" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* METRIC CARDS                                                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Menu</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">{metrics.total}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#4A0E4E] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tersedia</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-heading">{metrics.available}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Habis / Nonaktif</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1 font-heading">{metrics.unavailable}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Kategori Menu</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1 font-heading">{metrics.categoriesCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER & SEARCH BAR                                           */}
      {/* ============================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama menu atau deskripsi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer py-1"
            >
              <option value="ALL">Semua Kategori</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer py-1"
            >
              <option value="ALL">Semua Status</option>
              <option value="AVAILABLE">Hanya Tersedia</option>
              <option value="UNAVAILABLE">Hanya Habis</option>
            </select>
          </div>

          {(searchTerm || categoryFilter !== "ALL" || availabilityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("ALL");
                setAvailabilityFilter("ALL");
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRODUCTS TABLE / CARDS                                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#4A0E4E] animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Memuat data produk dari Supabase...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada menu yang sesuai dengan kata kunci atau filter yang Anda pilih.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A0E4E] text-white text-xs font-bold hover:bg-[#3D0840] transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Produk &amp; Foto</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga &amp; Satuan</th>
                  <th className="py-3.5 px-4 text-center">Status Ketersediaan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((product) => {
                  const isAvailable = product.is_available;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Column 1: Image & Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                              <span>{product.name}</span>
                              {product.badge && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase shrink-0">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono truncate max-w-xs">
                              /{product.slug}
                            </div>
                            {product.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-sm sm:max-w-md">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>

                      {/* Column 3: Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatIDR(product.price)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          per {product.unit || "pcs"}
                        </div>
                      </td>

                      {/* Column 4: Availability Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100"
                          }`}
                          title="Klik untuk mengubah ketersediaan produk langsung di Supabase"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{isAvailable ? "Tersedia" : "Habis"}</span>
                        </button>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#4A0E4E] hover:bg-purple-50 transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: TAMBAH / EDIT PRODUK                                   */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                  {editingProduct ? "Edit Produk Menu" : "Tambah Produk Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingProduct
                    ? "Perbarui informasi dan harga produk di Supabase."
                    : "Lengkapi data produk untuk menambah menu baru ke katalog."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Menu Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Paket Nasi Box Ayam Bakar Komplit"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none ${
                    formErrors.name
                      ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Kategori & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kategori */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm focus:outline-none focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Lainnya">Lainnya (Kustom)</option>
                  </select>

                  {formCategory === "Lainnya" && (
                    <input
                      type="text"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="Ketik kategori kustom..."
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#4A0E4E]"
                    />
                  )}
                  {formErrors.category && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.category}</p>
                  )}
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Satuan Jual <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm focus:outline-none focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {formErrors.unit && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.unit}</p>
                  )}
                </div>
              </div>

              {/* Harga & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Harga */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="25000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none ${
                      formErrors.price
                        ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                        : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                    }`}
                  />
                  {formErrors.price ? (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.price}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      Preview: {formatIDR(Number(formPrice) || 0)}
                    </p>
                  )}
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Badge / Label Produk
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Favorit / Best Seller / Promo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm focus:outline-none focus:border-[#4A0E4E]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BADGE_PRESETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormBadge(b)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          formBadge === b
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                    {formBadge && (
                      <button
                        type="button"
                        onClick={() => setFormBadge("")}
                        className="text-[10px] text-rose-500 px-1 py-0.5 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* URL Gambar & Thumbnail Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Gambar Foto Menu
                </label>
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {formImageUrl ? (
                      <Image
                        src={formImageUrl}
                        alt="Preview"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition focus:outline-none ${
                        formErrors.image_url
                          ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                          : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                      }`}
                    />
                    {formErrors.image_url && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {formErrors.image_url}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gunakan link gambar langsung (Unsplash, Imgur, Supabase Storage, dll).
                    </p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Menu (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan bumbu, isi paket, atau saran penyajian..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm focus:outline-none focus:border-[#4A0E4E] focus:ring-2 focus:ring-[#4A0E4E]/10"
                />
              </div>

              {/* Toggle Ketersediaan */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Status Ketersediaan Produk</div>
                  <div className="text-[11px] text-slate-500">
                    {formIsAvailable
                      ? "Produk aktif dan langsung dapat dipesan oleh pelanggan."
                      : "Produk berstatus habis dan tidak dapat dimasukkan ke keranjang."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsAvailable(!formIsAvailable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsAvailable ? "bg-[#4A0E4E]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formIsAvailable ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A0E4E] hover:bg-[#3D0840] text-white text-xs font-bold shadow-md shadow-[#4A0E4E]/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                      <span>Menyimpan ke Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-amber-200" />
                      <span>{editingProduct ? "Simpan Perubahan" : "Tambah ke Supabase"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI HAPUS PRODUK                                */}
      {/* ============================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 font-heading">
              Hapus Produk Menu?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk{" "}
              <strong className="text-slate-900 font-bold">"{productToDelete.name}"</strong> dari database Supabase? Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Produk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

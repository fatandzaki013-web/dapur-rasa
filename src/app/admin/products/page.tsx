"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  XCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ProductVariant {
  id?: string;
  name: string;
  priceAdjustment: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  price: number;
  sku?: string | null;
  unit: string;
  stock: number;
  minStockAlert: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNew: boolean;
  showOnHome: boolean;
  displayOrder: number;
  categoryId: string;
  category: { id: string; name: string };
  ingredients?: string | null;
  allergens?: string | null;
  storageGuide?: string | null;
  shelfLife?: string | null;
  weightGrams?: number | null;
  piecesPerPack?: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | string>(5000);
  const [unit, setUnit] = useState("pcs");
  const [stock, setStock] = useState<number | string>(20);
  const [minStockAlert, setMinStockAlert] = useState<number | string>(5);
  const [sku, setSku] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [showOnHome, setShowOnHome] = useState(true);

  // Details
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [storageGuide, setStorageGuide] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [weightGrams, setWeightGrams] = useState<number | string>("");
  const [piecesPerPack, setPiecesPerPack] = useState<number | string>(1);

  // Images & Variants
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error("Gagal mengambil data produk:", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil kategori:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => {
      clearTimeout(timer);
      setIsLoading(false);
    });
    return () => clearTimeout(timer);
  }, []);

  const handleExportBackup = async () => {
    try {
      const res = await fetch("/api/admin/products/backup");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal export data");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dapur-rasa-katalog-kue-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("File backup produk (JSON) berhasil diunduh.");
    } catch (err: any) {
      alert("Gagal backup: " + err.message);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/admin/products/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengimpor produk");
      showToast(data.message || "Produk berhasil diimpor.");
      fetchProducts();
    } catch (err: any) {
      alert("Gagal impor produk: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle availability directly from table
  const handleToggleAvailability = async (id: string, currentStatus: boolean, prodName: string) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status ketersediaan.");
      showToast(`Status "${prodName}" berhasil diubah menjadi: ${newStatus ? "Tersedia" : "Tidak Tersedia"}`);
    } catch (err: any) {
      // Revert
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: currentStatus } : p))
      );
      alert(err.message || "Gagal mengubah status ketersediaan.");
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setSlug("");
    setShortDescription("");
    setDescription("");
    setPrice(5000);
    setUnit("pcs");
    setStock(20);
    setMinStockAlert(5);
    setSku("");
    setIsAvailable(true);
    setIsBestSeller(false);
    setIsFeatured(false);
    setIsNew(false);
    setShowOnHome(true);
    setIngredients("");
    setAllergens("");
    setStorageGuide("");
    setShelfLife("");
    setWeightGrams("");
    setPiecesPerPack(1);
    setImages([]);
    setVariants([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setShortDescription(p.shortDescription || "");
    setDescription(p.description);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setUnit(p.unit);
    setStock(p.stock);
    setMinStockAlert(p.minStockAlert);
    setSku(p.sku || "");
    setIsAvailable(p.isAvailable);
    setIsBestSeller(p.isBestSeller);
    setIsFeatured(p.isFeatured);
    setIsNew(p.isNew);
    setShowOnHome(p.showOnHome);
    setIngredients(p.ingredients || "");
    setAllergens(p.allergens || "");
    setStorageGuide(p.storageGuide || "");
    setShelfLife(p.shelfLife || "");
    setWeightGrams(p.weightGrams ? p.weightGrams : "");
    setPiecesPerPack(p.piecesPerPack ? p.piecesPerPack : 1);
    setImages(p.images || []);
    setVariants(p.variants || []);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload gambar.");
      setImages((prev) => [...prev, { url: data.url, alt: name || "Foto Produk" }]);
      showToast("Foto berhasil diunggah!");
    } catch (err: any) {
      alert(err.message || "Gagal upload gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExternalImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, { url: newImageUrl.trim(), alt: name || "Foto Produk" }]);
    setNewImageUrl("");
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { name: "Varian Baru", priceAdjustment: 0, stock: 10 }]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !description.trim() || !categoryId) {
      setErrorMessage("Nama produk, deskripsi, dan kategori wajib diisi.");
      return;
    }

    const numPrice = Number(price);
    if (numPrice < 0) {
      setErrorMessage("Harga tidak boleh negatif.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim() || null,
      description: description.trim(),
      categoryId,
      price: numPrice,
      promoPrice: null, // Promo dihilangkan sesuai permintaan
      unit: unit.trim() || "pcs",
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      sku: sku.trim() || null,
      isAvailable,
      isBestSeller,
      isFeatured,
      isNew,
      showOnHome,
      ingredients: ingredients.trim() || null,
      allergens: allergens.trim() || null,
      storageGuide: storageGuide.trim() || null,
      shelfLife: shelfLife.trim() || null,
      weightGrams: weightGrams !== "" ? Number(weightGrams) : null,
      piecesPerPack: piecesPerPack !== "" ? Number(piecesPerPack) : 1,
      images,
      variants,
    };

    try {
      const url = isEditing ? `/api/admin/products/${currentId}` : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk.");

      showToast(isEditing ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus produk.");
      showToast(data.message || "Produk berhasil dihapus.");
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk.");
    }
  };

  // Filter products by search, category, and availability
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;

    let matchAvailability = true;
    if (availabilityFilter === "AVAILABLE") {
      matchAvailability = p.isAvailable === true;
    } else if (availabilityFilter === "UNAVAILABLE") {
      matchAvailability = p.isAvailable === false;
    }

    return matchSearch && matchCategory && matchAvailability;
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Manajemen Produk Kue
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola katalog kue, harga satuan, status ketersediaan (Tersedia / Tidak Tersedia), dan stok.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2544] hover:bg-[#163f6e] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kue Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A2544]/20"
          />
        </div>

        {/* Filter Ketersediaan: Tersedia vs Tidak Tersedia */}
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A2544]/20 font-semibold"
        >
          <option value="ALL">Semua Ketersediaan</option>
          <option value="AVAILABLE">🟢 Hanya Tersedia</option>
          <option value="UNAVAILABLE">🔴 Hanya Tidak Tersedia</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A2544]/20"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table Products */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-500">Memuat data produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Tidak ada produk yang cocok dengan pencarian / filter ketersediaan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga Satuan</th>
                  <th className="py-3 px-4">Stok</th>
                  <th className="py-3 px-4">Status Ketersediaan (Klik untuk Edit)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0 || !p.isAvailable;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                          {p.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{p.name}</div>
                        <div className="text-[11px] text-stone-400">
                          {p.sku ? `SKU: ${p.sku}` : `Slug: ${p.slug}`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {p.category?.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{formatPrice(p.price)}</div>
                        <span className="text-[10px] text-stone-400">/{p.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-red-600"
                              : p.stock <= p.minStockAlert
                              ? "text-amber-600"
                              : "text-stone-800"
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                        {p.stock <= p.minStockAlert && !isOutOfStock && (
                          <span className="text-[10px] text-amber-700 block">Stok Menipis</span>
                        )}
                      </td>
                      {/* Interactive Availability Toggle */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p.id, p.isAvailable, p.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                              p.isAvailable
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-400/30"
                                : "bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 ring-1 ring-red-400/30"
                            }`}
                            title={`Klik untuk ubah status menjadi ${p.isAvailable ? "Tidak Tersedia" : "Tersedia"}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.isAvailable ? "bg-emerald-600 animate-pulse" : "bg-red-600"
                              }`}
                            />
                            <span>{p.isAvailable ? "Tersedia" : "Tidak Tersedia"}</span>
                          </button>

                          <div className="flex flex-wrap gap-1">
                            {p.isBestSeller && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Best Seller
                              </span>
                            )}
                            {p.isNew && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-bold">
                                Baru
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-stone-600 hover:text-[#0A2544] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Produk & Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-heading font-bold text-xl text-stone-900">
                {isEditing ? "Edit Rincian Produk Kue" : "Tambah Produk Kue Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Form Section 1: Info Dasar */}
              <div className="space-y-4">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  1. Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nama Produk Kue <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Misal: Pastel Ayam Crispy"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0A2544]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Kategori <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#0A2544]/20"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2-Column Price & Unit (Promo Price completely removed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Harga Normal (Rp) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Satuan Penjualan
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="pcs / box / pack / toples"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Stok Saat Ini</label>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Batas Peringatan Stok Minim
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Kode SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="PST-01"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Deskripsi 1 kalimat untuk tampilan kartu katalog"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Deskripsi Lengkap <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ceritakan kelezatan, rasa, dan karakteristik kue ini..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Form Section 2: Foto Produk */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  2. Foto Produk
                </h3>

                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-700 font-semibold cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span>{isUploading ? "Mengunggah..." : "Upload File Foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Atau tempel URL gambar (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalImage}
                      className="px-3 py-2 bg-stone-800 text-white rounded-xl font-semibold cursor-pointer"
                    >
                      Tambah URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Section 3: Varian Produk */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                    3. Varian Produk (Rasa, Isi Kemasan, Topping)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[#0A2544] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Varian</span>
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-stone-400 italic">Tidak ada varian tambahan.</p>
                ) : (
                  <div className="space-y-2">
                    {variants.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                      >
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => handleUpdateVariant(i, "name", e.target.value)}
                          placeholder="Nama Varian (misal: Pedas / Isi 5 pcs)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                        />
                        <div className="w-36 flex items-center gap-1">
                          <span className="text-stone-400">+/- Rp</span>
                          <input
                            type="number"
                            value={v.priceAdjustment}
                            onChange={(e) =>
                              handleUpdateVariant(i, "priceAdjustment", Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="p-1 text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Section 4: Spesifikasi & Komposisi */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  4. Rincian &amp; Petunjuk Konsumen
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Komposisi Bahan
                    </label>
                    <input
                      type="text"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="Tepung, telur, daging ayam, lada..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Informasi Alergen
                    </label>
                    <input
                      type="text"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      placeholder="Mengandung telur dan gluten"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Petunjuk Penyimpanan
                    </label>
                    <input
                      type="text"
                      value={storageGuide}
                      onChange={(e) => setStorageGuide(e.target.value)}
                      placeholder="Simpan di kulkas, hangatkan di oven 3 menit"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Masa Simpan</label>
                    <input
                      type="text"
                      value={shelfLife}
                      onChange={(e) => setShelfLife(e.target.value)}
                      placeholder="1 hari suhu ruang, 3 hari kulkas"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 5: FITUR STATUS TERSEDIA & TIDAK TERSEDIA */}
              <div className="space-y-4">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  5. Status Ketersediaan Produk &amp; Label
                </h3>

                {/* 2-Card Selectable Selector for Tersedia vs Tidak Tersedia */}
                <div>
                  <label className="block font-bold text-stone-800 mb-2">
                    Ketersediaan Produk Kue <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAvailable(true)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isAvailable
                          ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {isAvailable && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-emerald-950 block">
                          🟢 Tersedia (Bisa Dipesan)
                        </span>
                        <span className="text-[11px] text-stone-600 leading-tight block mt-0.5">
                          Produk kue aktif dan dapat langsung dimasukkan ke keranjang belanja serta dicheckout pelanggan.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAvailable(false)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        !isAvailable
                          ? "border-red-600 bg-red-50/80 shadow-xs ring-2 ring-red-500/20"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {!isAvailable && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-red-950 block">
                          🔴 Tidak Tersedia (Habis / Nonaktif)
                        </span>
                        <span className="text-[11px] text-stone-600 leading-tight block mt-0.5">
                          Produk kue dinonaktifkan sementara. Tombol beli akan otomatis terkunci agar pembeli tidak memesan produk yang habis.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded text-[#0A2544]"
                    />
                    <span className="font-semibold text-stone-800">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="rounded text-[#0A2544]"
                    />
                    <span className="font-semibold text-stone-800">Label Baru</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={showOnHome}
                      onChange={(e) => setShowOnHome(e.target.checked)}
                      className="rounded text-[#0A2544]"
                    />
                    <span className="font-semibold text-stone-800">Tampil di Home</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0A2544] hover:bg-[#163f6e] text-white font-bold shadow-md cursor-pointer disabled:bg-stone-400"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

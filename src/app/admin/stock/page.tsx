"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  RotateCcw,
  History,
  X,
  AlertCircle,
} from "lucide-react";

interface ProductStock {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  unit: string;
  stock: number;
  minStockAlert: number;
  isAvailable: boolean;
  category: { name: string };
}

interface StockLogItem {
  id: string;
  productId: string;
  productName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [logs, setLogs] = useState<StockLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Adjust Stock
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);
  const [newStockValue, setNewStockValue] = useState<number | string>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStockData = async () => {
    try {
      const res = await fetch("/api/admin/stock");
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchStockData().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAdjustModal = (p: ProductStock) => {
    setSelectedProduct(p);
    setNewStockValue(p.stock);
    setAdjustmentReason("Penyesuaian stok berkala dapur");
    setErrorMessage(null);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const val = Number(newStockValue);
    if (isNaN(val) || val < 0) {
      setErrorMessage("Jumlah stok tidak boleh bernilai negatif.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          newStock: val,
          reason: adjustmentReason.trim() || "Penyesuaian manual stok",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui stok.");

      showToast(`Stok "${selectedProduct.name}" berhasil diubah menjadi ${val} ${selectedProduct.unit}.`);
      setSelectedProduct(null);
      fetchStockData();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui stok.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-600/30 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Manajemen Stok & Inventaris Kue
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau ketersediaan bahan dan stok kue harian, deteksi stok menipis, dan catat riwayat mutasi stok.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{lowStockCount} Produk Menjelang Habis</span>
          </div>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-stone-900">
            Daftar Inventaris Produk
          </h2>
          <span className="text-xs text-stone-500">{products.length} Jenis Kue</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-500">Memuat data stok...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Stok Saat Ini</th>
                  <th className="py-3 px-4">Batas Peringatan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock <= p.minStockAlert && !isOut;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{p.name}</div>
                        {p.sku && <div className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</div>}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.category?.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-extrabold ${
                            isOut
                              ? "text-red-600"
                              : isLow
                              ? "text-amber-600"
                              : "text-stone-900"
                          }`}
                        >
                          {p.stock}
                        </span>{" "}
                        <span className="text-stone-400 text-xs">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {p.minStockAlert} {p.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openAdjustModal(p)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors"
                        >
                          Ubah Stok
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock History Audit Logs */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-4">
        <h2 className="font-heading font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-700" />
          <span>Riwayat Mutasi & Perubahan Stok Terakhir</span>
        </h2>

        {logs.length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-400">Belum ada catatan mutasi stok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Waktu</th>
                  <th className="pb-2.5">Produk</th>
                  <th className="pb-2.5">Perubahan</th>
                  <th className="pb-2.5">Stok Sebelum / Sesudah</th>
                  <th className="pb-2.5">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => {
                  const isPositive = log.changeAmount > 0;
                  return (
                    <tr key={log.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 text-stone-500">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 font-bold text-stone-900">{log.productName}</td>
                      <td className="py-2.5">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? `+${log.changeAmount}` : log.changeAmount}
                        </span>
                      </td>
                      <td className="py-2.5 text-stone-600 font-mono text-[11px]">
                        {log.previousStock} → <strong>{log.newStock}</strong>
                      </td>
                      <td className="py-2.5 text-stone-600">{log.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-stone-400 text-[10px]">Penyesuaian Stok</span>
                <h2 className="font-heading font-bold text-base text-stone-900">
                  {selectedProduct.name}
                </h2>
              </div>
              <button onClick={() => setSelectedProduct(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Stok Baru Saat Ini ({selectedProduct.unit})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewStockValue((v) => Math.max(0, Number(v) - 1))
                    }
                    className="p-2 border rounded-xl hover:bg-stone-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    className="flex-1 text-center font-bold text-base px-3 py-2 border rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStockValue((v) => Number(v) + 1)}
                    className="p-2 border rounded-xl hover:bg-stone-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Alasan / Keterangan Penyesuaian
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Misal: Restock 50 pcs / Koreksi fisik / Rusak"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

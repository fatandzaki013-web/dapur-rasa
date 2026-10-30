"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Phone,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Printer,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  MapPin,
  Check,
  ChevronDown,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { supabase, SupabaseOrder, parseOrderItems, OrderItemPayload } from "@/lib/supabase";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SupabaseOrder | null>(null);
  const [orderToDelete, setProductToDelete] = useState<SupabaseOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Toast notification
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
  // FETCH ORDERS DARI SUPABASE
  // ==========================================
  const loadOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (err: any) {
      console.error("Gagal memuat pesanan Supabase:", err);
      showToast(err.message || "Gagal menarik daftar pesanan dari Supabase.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.includes(term) ||
        o.delivery_address?.toLowerCase().includes(term) ||
        o.id?.toLowerCase().includes(term);

      const status = (o.status || "pending").toLowerCase();
      const matchStatus =
        statusFilter === "ALL" || status === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const diproses = orders.filter((o) => (o.status || "").toLowerCase() === "diproses").length;
    const selesai = orders.filter((o) => (o.status || "").toLowerCase() === "selesai").length;
    const revenue = orders
      .filter((o) => (o.status || "").toLowerCase() === "selesai")
      .reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);

    return { total, pending, diproses, selesai, revenue };
  }, [orders]);

  // ==========================================
  // UPDATE STATUS PESANAN (DROPDOWN / TOGGLE)
  // ==========================================
  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderId(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;

      showToast(`Status pesanan berhasil diubah menjadi: "${nextStatus.toUpperCase()}".`, "success");
    } catch (err: any) {
      console.error("Gagal update status pesanan:", err);
      // Revert
      await loadOrders();
      showToast(err.message || "Gagal memperbarui status pesanan.", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ==========================================
  // HAPUS PESANAN
  // ==========================================
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete.id);

      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      showToast("Pesanan berhasil dihapus dari database Supabase.", "success");
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Gagal menghapus pesanan:", err);
      showToast(err.message || "Gagal menghapus pesanan.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cetak Struk
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
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

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#4A0E4E] text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Database Pesanan Supabase</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Daftar Pesanan Masuk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola pesanan pelanggan dari tabel <code>public.orders</code>, perbarui status pengiriman, dan hubungi pelanggan via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Muat ulang daftar pesanan"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Segarkan Pesanan</span>
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A0E4E] hover:bg-[#3D0840] text-white text-xs font-bold shadow-md shadow-[#4A0E4E]/20 transition"
          >
            <span>Kelola Katalog Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Masuk</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-heading">{metrics.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1 font-heading">{metrics.pending}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-[#4A0E4E] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#4A0E4E]" />
            <span>Diproses</span>
          </div>
          <div className="text-2xl font-black text-[#4A0E4E] mt-1 font-heading">{metrics.diproses}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selesai</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-heading">{metrics.selesai}</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Omset Selesai</span>
          </div>
          <div className="text-lg font-black text-emerald-700 mt-1.5 font-heading truncate" title={formatIDR(metrics.revenue)}>
            {formatIDR(metrics.revenue)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, no WA, atau alamat..."
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer py-1"
            >
              <option value="ALL">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Pesanan */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#4A0E4E] animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Memuat pesanan dari Supabase...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum ada pesanan ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Pesanan yang dibuat oleh pelanggan di halaman checkout akan otomatis masuk dan tersimpan di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Waktu &amp; ID</th>
                  <th className="py-3.5 px-4">Pemesan &amp; WA</th>
                  <th className="py-3.5 px-4">Alamat Pengantaran</th>
                  <th className="py-3.5 px-4">Rincian Menu</th>
                  <th className="py-3.5 px-4">Total Harga</th>
                  <th className="py-3.5 px-4 text-center">Status Pesanan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredOrders.map((order) => {
                  const status = (order.status || "pending").toLowerCase();
                  const parsedItems = parseOrderItems(order.items);
                  const cleanPhone = (order.customer_phone || "").replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition group">
                      {/* Tanggal / Jam */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: {order.id?.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Pemesan & No WA */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{order.customer_phone}</div>
                        {order.customer_phone && (
                          <a
                            href={buildWhatsAppLink(
                              `Halo Kak ${order.customer_name}, kami dari Dapur Rasa mengonfirmasi pesanan Anda.`,
                              order.customer_phone
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Chat WhatsApp</span>
                          </a>
                        )}
                      </td>

                      {/* Alamat Pengantaran */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-800 line-clamp-2 leading-relaxed">
                              {order.delivery_address || "Diambil Sendiri di Toko"}
                            </span>
                            {order.notes && (
                              <p className="text-[11px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-200 line-clamp-1">
                                Catatan: {order.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rincian Item */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {parsedItems.slice(0, 2).map((it, idx) => (
                            <div key={idx} className="text-xs text-slate-700 truncate">
                              • <span className="font-semibold">{it.name}</span>{" "}
                              <span className="text-slate-400">({it.quantity}x)</span>
                            </div>
                          ))}
                          {parsedItems.length > 2 && (
                            <span className="text-[11px] text-purple-700 font-bold">
                              +{parsedItems.length - 2} menu lainnya...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Harga */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 font-heading text-sm sm:text-base">
                          {formatIDR(order.total_price)}
                        </span>
                      </td>

                      {/* Status Pesanan & Dropdown Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={status}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none transition ${
                              status === "selesai"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                : status === "diproses"
                                ? "bg-purple-50 text-[#4A0E4E] border-purple-300 hover:bg-purple-100"
                                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                            }`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="diproses">🔄 Diproses</option>
                            <option value="selesai">✅ Selesai</option>
                          </select>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#4A0E4E] hover:bg-purple-50 transition cursor-pointer"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(order)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Pesanan"
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
      {/* MODAL: DETAIL PESANAN & STRUK CETAK                           */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ID: {selectedOrder.id}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                  Detail Pesanan Pelanggan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs sm:text-sm">
              {/* Info Pelanggan */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pemesan:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Order:</span>
                  <span className="text-slate-700">{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Alamat Pengiriman:</span>
                  <span className="font-medium text-slate-800 leading-relaxed block">
                    {selectedOrder.delivery_address || "Diambil Sendiri"}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500 block mb-0.5">Catatan Khusus:</span>
                    <span className="font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block">
                      {selectedOrder.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Rincian Menu Items */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Rincian Menu ({parseOrderItems(selectedOrder.items).length} Macam)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {parseOrderItems(selectedOrder.items).map((it, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/50">
                      <div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatIDR(it.price)} x {it.quantity}
                        </div>
                      </div>
                      <div className="font-extrabold text-[#4A0E4E]">
                        {formatIDR(it.subtotal || it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-purple-50/40 flex justify-between items-center font-bold">
                    <span>Total Pembayaran:</span>
                    <span className="text-base font-black text-[#4A0E4E] font-heading">
                      {formatIDR(selectedOrder.total_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ubah Status */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700">Ubah Status Pesanan:</span>
                <select
                  value={(selectedOrder.status || "pending").toLowerCase()}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white cursor-pointer focus:outline-none focus:border-[#4A0E4E]"
                >
                  <option value="pending">⏳ Pending (Menunggu)</option>
                  <option value="diproses">🔄 Sedang Diproses</option>
                  <option value="selesai">✅ Selesai Diterima</option>
                </select>
              </div>

              {/* Tombol Cetak & Tutup */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak Struk Nota</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-[#4A0E4E] text-white font-bold text-xs hover:bg-[#3D0840] transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI HAPUS PESANAN                                */}
      {/* ============================================================== */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 font-heading">
              Hapus Pesanan Ini?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus pesanan dari{" "}
              <strong className="text-slate-900 font-bold">"{orderToDelete.customer_name}"</strong> (Total: {formatIDR(orderToDelete.total_price)}) dari Supabase? Tindakan ini tidak dapat dibatalkan.
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
                onClick={confirmDeleteOrder}
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
                    <span>Ya, Hapus Pesanan</span>
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

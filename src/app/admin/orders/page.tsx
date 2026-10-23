"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Phone,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: string;
  deliveryAddress?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  adminNotes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [reduceStockOnConfirm, setReduceStockOnConfirm] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchOrders().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setAdminNotes(order.adminNotes || "");
    setReduceStockOnConfirm(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          adminNotes: adminNotes.trim() || null,
          reduceStockOnConfirm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui pesanan.");

      showToast(`Status pesanan ${selectedOrder.orderCode} berhasil diperbarui.`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChatCustomer = (order: Order) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith("62")) cleanPhone = "62" + cleanPhone;

    const message = `Halo Kak ${order.customerName}, terima kasih telah memesan di Dapur Rasa!

Kami ingin mengonfirmasi pesanan Anda dengan kode ref: *${order.orderCode}*.
Total tagihan: Rp ${order.totalAmount.toLocaleString("id-ID")}.

Status saat ini: *${newStatus || order.status}*.
Apakah ada rincian tambahan sebelum pesanan kami proses? Terima kasih.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU_KONFIRMASI":
        return <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">Menunggu Konfirmasi</span>;
      case "DIKONFIRMASI":
        return <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 text-[11px] font-bold">Dikonfirmasi</span>;
      case "SEDANG_DIPROSES":
        return <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 text-[11px] font-bold">Sedang Diproses</span>;
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM":
        return <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-900 text-[11px] font-bold">Siap Antar/Ambil</span>;
      case "SELESAI":
        return <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold">Selesai</span>;
      case "DIBATALKAN":
        return <span className="px-2.5 py-1 rounded bg-red-100 text-red-900 text-[11px] font-bold">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-700 text-[11px]">{status}</span>;
    }
  };

  const statuses = [
    { label: "Semua Status", value: "" },
    { label: "Menunggu Konfirmasi", value: "MENUNGGU_KONFIRMASI" },
    { label: "Dikonfirmasi", value: "DIKONFIRMASI" },
    { label: "Sedang Diproses", value: "SEDANG_DIPROSES" },
    { label: "Siap Dikirim / Diambil", value: "SIAP_DIKIRIM" },
    { label: "Selesai", value: "SELESAI" },
    { label: "Dibatalkan", value: "DIBATALKAN" },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Manajemen Pesanan Masuk
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Pantau seluruh pesanan pelanggan, ubah status dapur, dan hubungi pelanggan langsung via WhatsApp.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor pesanan, nama pelanggan, atau no. WA..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === st.value
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-500">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">Belum ada pesanan yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Pesanan</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Item Kue</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {ord.orderCode}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div className="font-semibold text-stone-900">
                        {ord.fulfillmentType === "DELIVERY"
                          ? "Pengantaran (Griya Cileungsi 5)"
                          : "Ambil di Toko"}
                      </div>
                      {ord.deliveryAddress && (
                        <div className="text-[11px] text-stone-500 truncate max-w-[200px]" title={ord.deliveryAddress}>
                          {ord.deliveryAddress}
                        </div>
                      )}
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 bg-emerald-100 text-emerald-800">
                        {ord.fulfillmentType === "DELIVERY" ? "Bayar saat Diantar" : "Bayar saat Diambil"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {ord.items.length} Macam Kue
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 font-heading">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleChatCustomer(ord)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Chat WA Pelanggan"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDetailModal(ord)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail & Status Update */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-stone-400 font-mono text-[10px]">Detail Pesanan</span>
                <h2 className="font-heading font-bold text-xl text-stone-900">
                  {selectedOrder.orderCode}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div>
                <span className="font-bold text-stone-500 uppercase text-[10px] block">Pemesan</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5">{selectedOrder.customerName}</div>
                <div className="text-stone-600 font-mono">{selectedOrder.customerPhone}</div>
              </div>

              <div>
                <span className="font-bold text-stone-500 uppercase text-[10px] block">Metode Pengantaran / Pengambilan</span>
                <div className="font-bold text-stone-900 mt-0.5">
                  {selectedOrder.fulfillmentType === "DELIVERY" ? "Pengantaran (Perum Griya Cileungsi 5)" : "Ambil Sendiri di Dapur"}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {selectedOrder.fulfillmentType === "DELIVERY" ? "Bayar Tunai saat Diantar" : "Bayar Tunai saat Diambil"}
                  </span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <p className="text-stone-700 mt-1.5 leading-relaxed text-xs bg-white p-2 rounded-lg border border-stone-200">
                    <strong>Alamat:</strong> {selectedOrder.deliveryAddress}
                  </p>
                )}
              </div>

              {(selectedOrder.scheduleDate || selectedOrder.scheduleTime) && (
                <div className="sm:col-span-2 pt-2 border-t border-stone-200 text-stone-700">
                  <span className="font-bold">Jadwal yang diminta: </span>
                  {selectedOrder.scheduleDate} {selectedOrder.scheduleTime}
                </div>
              )}

              {selectedOrder.notes && (
                <div className="sm:col-span-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block">Catatan Pelanggan:</span>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Items Breakdown Table */}
            <div>
              <h3 className="font-bold text-stone-900 uppercase text-[11px] mb-2">
                Rincian Item Kue:
              </h3>
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3">Harga</th>
                      <th className="py-2.5 px-3">Jumlah</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-stone-900">{it.productName}</span>
                          {it.variantName && (
                            <span className="text-amber-800 text-[11px] block">
                              Varian: {it.variantName}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">{formatPrice(it.unitPrice)}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-800">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                          {formatPrice(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50/70 border-t border-stone-200 font-bold">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-stone-500">Subtotal:</td>
                      <td className="py-2 px-3 text-right">{formatPrice(selectedOrder.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-stone-500">Ongkir:</td>
                      <td className="py-2 px-3 text-right">{formatPrice(selectedOrder.shippingFee)}</td>
                    </tr>
                    <tr className="border-t border-stone-200 text-sm">
                      <td colSpan={3} className="py-2.5 px-3 text-stone-900">Total Tagihan:</td>
                      <td className="py-2.5 px-3 text-right text-theme-primary font-heading font-extrabold">
                        {formatPrice(selectedOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateOrder} className="space-y-4 pt-2 border-t border-stone-100">
              <h3 className="font-bold text-stone-900 uppercase text-[11px]">
                Perbarui Status Pesanan & Catatan Dapur:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Alur Pesanan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                  >
                    <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
                    <option value="DIKONFIRMASI">Dikonfirmasi (Kue Siap Dibuat)</option>
                    <option value="SEDANG_DIPROSES">Sedang Diproses Dapur</option>
                    <option value="SIAP_DIAMBIL">Siap Diambil di Dapur</option>
                    <option value="SIAP_DIKIRIM">Siap Dikirim ke Alamat</option>
                    <option value="SELESAI">Selesai (Sudah Diterima)</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Pembayaran</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="BELUM_DIVERIFIKASI">Belum Diverifikasi</option>
                    <option value="LUNAS">Lunas (Transfer / Tunai)</option>
                    <option value="DP">Uang Muka (DP)</option>
                  </select>
                </div>
              </div>

              {newStatus === "DIKONFIRMASI" && selectedOrder.status !== "DIKONFIRMASI" && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reduceStockOnConfirm}
                    onChange={(e) => setReduceStockOnConfirm(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span className="font-semibold">
                    Kurangi stok kue otomatis sesuai jumlah pesanan saat konfirmasi
                  </span>
                </label>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Internal Admin / Dapur</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Misal: Sudah transfer via BCA, diambil jam 2 siang..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleChatCustomer(selectedOrder)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Pesan Konfirmasi WA</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Status"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Memuat pesanan...</div>}>
      <AdminOrdersContent />
    </React.Suspense>
  );
}

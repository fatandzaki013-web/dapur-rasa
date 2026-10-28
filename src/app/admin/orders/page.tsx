"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Edit3,
  Trash2,
  ChevronDown,
  Search,
  Phone,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  Printer,
  Download,
  Bell,
  BellOff,
  Copy,
  Check,
  UtensilsCrossed,
  Truck,
  Store,
  RefreshCw,
  Clock,
  CheckCircle2,
  Cake,
  MapPin,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Notifikasi Pesanan Baru
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrdersCountRef = useRef<number | null>(null);

  // Modal Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [reduceStockOnConfirm, setReduceStockOnConfirm] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const getStatusLabel = (st: string) => {
    switch (st) {
      case "MENUNGGU_KONFIRMASI": return "Menunggu Konfirmasi";
      case "DIKONFIRMASI": return "Dikonfirmasi";
      case "SEDANG_DIPROSES": return "Sedang Diproses";
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM": return "Siap Dikirim / Diambil";
      case "SELESAI": return "Selesai";
      case "DIBATALKAN": return "Dibatalkan";
      default: return st;
    }
  };

  const getStatusSelectStyle = (st: string) => {
    switch (st) {
      case "MENUNGGU_KONFIRMASI":
        return "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/90";
      case "DIKONFIRMASI":
        return "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100/90";
      case "SEDANG_DIPROSES":
        return "bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100/90";
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM":
        return "bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100/90";
      case "SELESAI":
        return "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90";
      case "DIBATALKAN":
        return "bg-red-50 text-red-900 border-red-300 hover:bg-red-100/90";
      default:
        return "bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100";
    }
  };

  const handleInlineStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderId(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          reduceStockOnConfirm: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status.");

      showToast(`✓ Status pesanan berhasil diubah ke: ${getStatusLabel(nextStatus)}`);
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status pesanan.");
      fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleQuickModalStatus = (st: string) => {
    setNewStatus(st);
  };

  const handleDeleteOrder = async (orderId: string, orderCode: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pesanan ${orderCode}? Data pesanan ini akan dihapus permanen.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pesanan.");

      showToast(`✓ Pesanan ${orderCode} berhasil dihapus.`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pesanan.");
    }
  };

  // Modal Cetak Struk
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isCopiedReceipt, setIsCopiedReceipt] = useState(false);

  // Inisialisasi pengaturan suara dari localStorage
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem("dr_admin_sound_enabled");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
    } catch (e) {}
  }, []);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Nada 1: D5 (587.33Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Nada 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);
    } catch (e) {
      // Audio fallback jika dibatasi browser
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("dr_admin_sound_enabled", String(next));
    } catch (e) {}
    if (next) {
      playChime();
      showToast("Suara notifikasi pesanan baru diaktifkan 🔔");
    } else {
      showToast("Suara notifikasi pesanan dinonaktifkan 🔕");
    }
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) {
        // Deteksi apakah ada pesanan baru bertambah
        if (previousOrdersCountRef.current !== null && data.orders.length > previousOrdersCountRef.current) {
          const newOrders = data.orders.filter(
            (o: Order) => o.status === "MENUNGGU_KONFIRMASI"
          );
          if (newOrders.length > 0) {
            if (soundEnabled) playChime();
            showToast(`🔔 Ada ${newOrders.length} pesanan baru menunggu konfirmasi dapur!`);
          }
        }
        previousOrdersCountRef.current = data.orders.length;
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchOrders().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm]);

  // Real-time auto-polling setiap 20 detik untuk mendeteksi order baru
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [statusFilter, searchTerm, soundEnabled]);

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

  // Ekspor Laporan Pesanan ke CSV / Excel
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("Tidak ada data pesanan untuk diekspor.");
      return;
    }

    const headers = [
      "No. Pesanan",
      "Tanggal Pesanan",
      "Jam",
      "Nama Pelanggan",
      "Nomor WhatsApp",
      "Metode Pengiriman",
      "Alamat Pengantaran",
      "Rincian Item Kue",
      "Catatan Pelanggan",
      "Metode Pembayaran",
      "Status Pesanan",
      "Status Pembayaran",
      "Subtotal (Rp)",
      "Ongkir (Rp)",
      "Total Tagihan (Rp)",
    ];

    const rows = orders.map((o) => {
      const d = new Date(o.createdAt);
      const dateStr = d.toLocaleDateString("id-ID");
      const timeStr = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const itemsSummary = o.items
        .map((it) => `${it.productName}${it.variantName ? ` (${it.variantName})` : ""} x${it.quantity}`)
        .join("; ");
      const fulfillment = o.fulfillmentType === "DELIVERY" ? "Pengantaran Griya Cileungsi 5" : "Ambil di Toko";

      return [
        `"${o.orderCode}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"'${o.customerPhone}"`, // prepend ' so Excel preserves leading zero
        `"${fulfillment}"`,
        `"${(o.deliveryAddress || "-").replace(/"/g, '""')}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${(o.notes || "-").replace(/"/g, '""')}"`,
        `"${(o.paymentMethod || "COD").replace(/"/g, '""')}"`,
        `"${o.status}"`,
        `"${o.paymentStatus}"`,
        o.subtotal,
        o.shippingFee,
        o.totalAmount,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan-Pesanan-Dapur-Rasa-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Laporan pesanan berhasil diekspor ke format CSV / Excel!");
  };

  const handleCopyReceipt = (ord: Order) => {
    const itemsList = ord.items
      .map(
        (it) =>
          `• ${it.productName}${it.variantName ? ` (${it.variantName})` : ""} x ${it.quantity} = Rp ${(
            it.unitPrice * it.quantity
          ).toLocaleString("id-ID")}`
      )
      .join("\n");

    const text = `====================================
STRUK PESANAN - DAPUR RASA
Perum Griya Cileungsi 5 Blok A8 No. 01
WhatsApp: 085888159765
====================================
No. Pesanan   : ${ord.orderCode}
Tanggal       : ${new Date(ord.createdAt).toLocaleString("id-ID")}
Pelanggan     : ${ord.customerName} (${ord.customerPhone})
Pengantaran   : ${ord.fulfillmentType === "DELIVERY" ? `Diantar ke ${ord.deliveryAddress || "-"}` : "Ambil Sendiri di Dapur"}
Pembayaran    : ${ord.paymentMethod || "COD"} (${ord.paymentStatus})
${ord.notes ? `Catatan       : ${ord.notes}\n` : ""}
RINCIAN KUE:
${itemsList}

Subtotal      : Rp ${ord.subtotal.toLocaleString("id-ID")}
Ongkos Kirim  : Rp ${ord.shippingFee.toLocaleString("id-ID")}
TOTAL TAGIHAN : Rp ${ord.totalAmount.toLocaleString("id-ID")}
====================================
Terima kasih atas pesanannya!
====================================`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopiedReceipt(true);
      setTimeout(() => setIsCopiedReceipt(false), 2000);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPaymentBadge = (method?: string | null, fulfillment?: string) => {
    const raw = (method || "").trim();
    const isTransfer =
      raw.toLowerCase().includes("transfer") ||
      raw.toLowerCase().includes("bca") ||
      raw.toLowerCase().includes("mandiri") ||
      raw.toLowerCase().includes("bri") ||
      raw.toLowerCase().includes("bank");
    const isCod =
      raw.toLowerCase().includes("cod") ||
      raw.toLowerCase().includes("tunai") ||
      raw.toLowerCase().includes("saat diterima") ||
      raw.toLowerCase().includes("saat diantar") ||
      raw.toLowerCase().includes("saat diambil") ||
      (!raw && fulfillment === "DELIVERY");

    if (isTransfer) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200/80 whitespace-nowrap shrink-0 shadow-2xs">
          <span>🏦</span>
          <span>Transfer Bank</span>
        </span>
      );
    }

    if (isCod) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80 whitespace-nowrap shrink-0 shadow-2xs">
          <span>💵</span>
          <span>Bayar di Tempat (COD)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 whitespace-nowrap shrink-0 shadow-2xs">
        <span>💳</span>
        <span>{raw || "Bayar di Dapur"}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU_KONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Menunggu Konfirmasi</span>
          </span>
        );
      case "DIKONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Dikonfirmasi</span>
          </span>
        );
      case "SEDANG_DIPROSES":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <Cake className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Diproses Dapur</span>
          </span>
        );
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Siap Antar / Ambil</span>
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Selesai</span>
          </span>
        );
      case "DIBATALKAN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-900 border border-red-200 text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            {status}
          </span>
        );
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

      {/* Header dengan Aksi Operasional: Suara & Ekspor CSV */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Manajemen Pesanan Masuk
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau pesanan dapur secara real-time, cetak struk pesanan, dan ekspor laporan transaksi penjualan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Toggle Suara Notifikasi */}
          <button
            onClick={toggleSound}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
              soundEnabled
                ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                : "bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200"
            }`}
            title={soundEnabled ? "Klik untuk mematikan suara pesanan" : "Klik untuk membunyikan alarm pesanan"}
          >
            {soundEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Alarm Suara: Aktif</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-stone-400" />
                <span>Alarm Suara: Mati</span>
              </>
            )}
          </button>

          {/* Tombol Ekspor Laporan CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV / Excel</span>
          </button>

          {/* Tombol Refresh Manual */}
          <button
            onClick={() => fetchOrders()}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs transition cursor-pointer"
            title="Muat ulang daftar pesanan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-700 focus:outline-hidden"
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
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Pesanan */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Belum ada pesanan yang sesuai filter.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-36 whitespace-nowrap">No. Pesanan</th>
                  <th className="py-3 px-4 w-32 whitespace-nowrap">Tanggal Masuk</th>
                  <th className="py-3 px-4 w-44 min-w-[150px]">Pelanggan</th>
                  <th className="py-3 px-4 w-60 min-w-[210px]">Metode &amp; Alamat</th>
                  <th className="py-3 px-4 w-48 min-w-[160px]">Item Kue</th>
                  <th className="py-3 px-4 w-32 whitespace-nowrap">Total Tagihan</th>
                  <th className="py-3 px-4 w-44 min-w-[160px] whitespace-nowrap">Status Pesanan</th>
                  <th className="py-3 px-4 text-right w-28 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 1. No. Pesanan */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/60 text-xs">
                        {ord.orderCode}
                      </span>
                    </td>

                    {/* 2. Tanggal Masuk */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="font-semibold text-xs text-slate-800">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(ord.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </div>
                    </td>

                    {/* 3. Pelanggan */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-xs text-slate-900 max-w-[150px] truncate" title={ord.customerName}>
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {ord.customerPhone}
                      </div>
                    </td>

                    {/* 4. Metode & Alamat (Clean, Crisp, Professional) */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="space-y-1.5 min-w-[200px]">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 whitespace-nowrap">
                          {ord.fulfillmentType === "DELIVERY" ? (
                            <>
                              <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                                <Truck className="w-3 h-3" />
                              </div>
                              <span>Diantar ke Rumah</span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <Store className="w-3 h-3" />
                              </div>
                              <span>Ambil di Dapur</span>
                            </>
                          )}
                        </div>

                        {ord.fulfillmentType === "DELIVERY" ? (
                          ord.deliveryAddress ? (
                            <div className="flex items-start gap-1 text-[11px] text-slate-500 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate max-w-[210px] leading-tight" title={ord.deliveryAddress}>
                                {ord.deliveryAddress}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10.5px] text-slate-400 block pl-6">Area Griya Cileungsi 5</span>
                          )
                        ) : (
                          <span className="text-[10.5px] text-slate-400 block pl-6">Perum Griya Cileungsi 5 Blok A8</span>
                        )}

                        <div className="pt-0.5">
                          {formatPaymentBadge(ord.paymentMethod, ord.fulfillmentType)}
                        </div>
                      </div>
                    </td>

                    {/* 5. Item Kue */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-bold text-xs text-slate-900 block whitespace-nowrap">
                        {ord.items.length} Macam Kue
                      </span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px] mt-0.5" title={ord.items.map((it) => `${it.productName} (x${it.quantity})`).join(", ")}>
                        {ord.items.map((it) => it.productName).join(", ")}
                      </div>
                    </td>

                    {/* 6. Total Tagihan */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                      {formatPrice(ord.totalAmount)}
                    </td>

                    {/* 7. Status Pesanan (Interactive Editable Dropdown Langsung di Tabel) */}
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">
                      <div className="relative inline-block w-full max-w-[195px]">
                        <select
                          value={ord.status}
                          disabled={updatingOrderId === ord.id}
                          onChange={(e) => handleInlineStatusChange(ord.id, e.target.value)}
                          className={`w-full cursor-pointer appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/30 ${getStatusSelectStyle(
                            ord.status
                          )}`}
                          title="Klik untuk langsung mengubah status pesanan"
                        >
                          <option value="MENUNGGU_KONFIRMASI">🕒 Menunggu Konfirmasi</option>
                          <option value="DIKONFIRMASI">✓ Dikonfirmasi</option>
                          <option value="SEDANG_DIPROSES">🍳 Sedang Diproses</option>
                          <option value="SIAP_DIKIRIM">📦 Siap Dikirim / Diambil</option>
                          <option value="SELESAI">🎉 Selesai</option>
                          <option value="DIBATALKAN">✕ Dibatalkan</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                          {updatingOrderId === ord.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 8. Aksi */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintingOrder(ord)}
                          className="p-1.5 bg-purple-50 text-[#4A0E4E] hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                          title="Cetak Struk/Nota Pesanan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleChatCustomer(ord)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Hubungi via WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDetailModal(ord)}
                          className="px-2.5 py-1.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                          title="Buka rincian lengkap & edit pesanan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id, ord.orderCode)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL 1: Detail & Status Update */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-stone-400 font-mono text-[10px]">Detail Pesanan Masuk</span>
                <h2 className="font-heading font-bold text-xl text-stone-900">
                  {selectedOrder.orderCode}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
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
                  {formatPaymentBadge(selectedOrder.paymentMethod, selectedOrder.fulfillmentType)}
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
              {/* Quick Status Action Bar */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Pintasan Cepat Ubah Status:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("MENUNGGU_KONFIRMASI")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "MENUNGGU_KONFIRMASI"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("DIKONFIRMASI")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "DIKONFIRMASI"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("SEDANG_DIPROSES")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "SEDANG_DIPROSES"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <Cake className="w-3.5 h-3.5" />
                    <span>Proses Dapur</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("SIAP_DIKIRIM")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "SIAP_DIKIRIM"
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Siap Antar/Ambil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("SELESAI")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "SELESAI"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickModalStatus("DIBATALKAN")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      newStatus === "DIBATALKAN"
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-stone-700 border hover:bg-stone-100"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Batalkan</span>
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-stone-900 uppercase text-[11px]">
                Perbarui Status Pesanan &amp; Catatan Dapur:
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

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleChatCustomer(selectedOrder)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Chat WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrintingOrder(selectedOrder);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#4A0E4E] border border-purple-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Struk</span>
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderCode)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer mr-auto"
                    title="Hapus Pesanan Permanen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Pesanan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border rounded-xl hover:bg-stone-50 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Status"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK STRUK / NOTA PESANAN (THERMAL & A4 READY) */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col print:shadow-none print:border-none print:max-w-none print:w-full">
            {/* Header Dialog (Tersembunyi saat diprint) */}
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50 print:hidden">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                <Printer className="w-4 h-4 text-amber-700" />
                <span>Pratinjau Struk Dapur</span>
              </div>
              <button
                onClick={() => setPrintingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BADAN STRUK: Ukuran Standar Thermal Roll / Nota Kasir */}
            <div
              id="printable-order-receipt"
              className="p-6 font-mono text-xs text-stone-900 space-y-4 bg-white print:p-0"
            >
              {/* Header Toko */}
              <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-3">
                <h2 className="text-base font-extrabold uppercase tracking-wider font-sans">
                  DAPUR RASA
                </h2>
                <p className="text-[10px] text-stone-600 font-sans">
                  Perum Griya Cileungsi 5 Blok A8 No. 01
                </p>
                <p className="text-[10px] text-stone-600">WhatsApp: 085888159765</p>
              </div>

              {/* Data No Pesanan & Waktu */}
              <div className="border-b border-dashed border-stone-300 pb-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">No. Ref:</span>
                  <span className="font-bold">{printingOrder.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Waktu:</span>
                  <span>{new Date(printingOrder.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pemesan:</span>
                  <span className="font-bold">{printingOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">No. WA:</span>
                  <span>{printingOrder.customerPhone}</span>
                </div>
              </div>

              {/* Pengiriman & Pembayaran */}
              <div className="border-b border-dashed border-stone-300 pb-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Pengiriman:</span>
                  <span className="font-bold">
                    {printingOrder.fulfillmentType === "DELIVERY" ? "Diantar ke Rumah" : "Ambil Sendiri"}
                  </span>
                </div>
                {printingOrder.deliveryAddress && (
                  <div className="pt-0.5 text-stone-700">
                    <span className="text-stone-500 text-[10px] block">Alamat Pengantaran:</span>
                    <span className="font-bold">{printingOrder.deliveryAddress}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="font-bold uppercase">{printingOrder.paymentMethod || "COD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status Bayar:</span>
                  <span className="font-bold">{printingOrder.paymentStatus}</span>
                </div>
                {printingOrder.notes && (
                  <div className="pt-1 text-stone-600 italic">
                    Catatan: &ldquo;{printingOrder.notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Item Belanja */}
              <div className="border-b border-dashed border-stone-300 pb-3 space-y-1.5">
                <div className="font-bold uppercase text-[10px] text-stone-500 pb-1">
                  Daftar Pesanan:
                </div>
                {printingOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <div className="font-bold">{it.productName}</div>
                      {it.variantName && <div className="text-[10px] text-stone-500">{it.variantName}</div>}
                      <div className="text-[10px] text-stone-500">
                        {it.quantity} × Rp {it.unitPrice.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="font-bold shrink-0">
                      Rp {it.subtotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Ongkir */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal:</span>
                  <span>Rp {printingOrder.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkos Kirim:</span>
                  <span>{printingOrder.shippingFee > 0 ? `Rp ${printingOrder.shippingFee.toLocaleString("id-ID")}` : "GRATIS"}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-stone-300 pt-1.5 text-black">
                  <span>TOTAL TAGIHAN:</span>
                  <span>Rp {printingOrder.totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Footer Struk */}
              <div className="text-center pt-2 text-[10px] text-stone-500 border-t border-dashed border-stone-300 space-y-0.5">
                <p className="font-semibold text-stone-700">Terima kasih atas pesanan Anda!</p>
                <p>Kue lezat &amp; fresh rumahan khas Dapur Rasa.</p>
              </div>
            </div>

            {/* Tombol Aksi (Tersembunyi saat diprint) */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Sekarang</span>
              </button>

              <button
                onClick={() => handleCopyReceipt(printingOrder)}
                className="py-2.5 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                title="Salin teks struk untuk dikirim via WA/SMS"
              >
                {isCopiedReceipt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setPrintingOrder(null)}
                className="py-2.5 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Stylesheet: Hanya Cetak Elemen Struk */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-order-receipt,
          #printable-order-receipt * {
            visibility: visible !important;
          }
          #printable-order-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
            padding: 10px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
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

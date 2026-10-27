"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  Package,
  Truck,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  RotateCw,
  Phone,
  Eye,
  Search,
  Sparkles,
  Layers,
  Store,
  Cake,
  Palette,
  Settings,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

interface OverviewMetrics {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalGallery: number;
  categoriesCount: number;
  totalOrders: number;
  statusCounts: {
    MENUNGGU_KONFIRMASI: number;
    DIKONFIRMASI: number;
    SEDANG_DIPROSES: number;
    SIAP_DIAMBIL: number;
    SIAP_DIKIRIM: number;
    SELESAI: number;
    DIBATALKAN: number;
  };
  confirmedRevenue: number;
}

interface RecentOrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: string;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
}

interface TopCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface DailySale {
  date: string;
  dayName: string;
  revenue: number;
  orderCount: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<DailySale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search state for recent orders
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");

  const fetchOverviewData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.recentOrders) setRecentOrders(data.recentOrders);
      if (data.lowStockProducts) setLowStockProducts(data.lowStockProducts);
      if (data.topCategories) setTopCategories(data.topCategories);
      if (data.weeklyTrend) setWeeklyTrend(data.weeklyTrend);
    } catch (e) {
      console.error("Error loading dashboard overview:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
    }, 3000);
    fetchOverviewData().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80 whitespace-nowrap shrink-0 shadow-2xs">
          <span>🏦</span>
          <span>Transfer Bank</span>
        </span>
      );
    }

    if (isCod) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 whitespace-nowrap shrink-0 shadow-2xs">
          <span>💵</span>
          <span>Bayar di Tempat (COD)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap shrink-0 shadow-2xs">
        <span>💳</span>
        <span>{raw || "Bayar di Dapur"}</span>
      </span>
    );
  };

const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU_KONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold shrink-0">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Menunggu Konfirmasi</span>
          </span>
        );
      case "DIKONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold shrink-0">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>Dikonfirmasi</span>
          </span>
        );
      case "SEDANG_DIPROSES":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold shrink-0">
            <Cake className="w-3 h-3 text-purple-700" />
            <span>Diproses Dapur</span>
          </span>
        );
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-bold shrink-0">
            <Truck className="w-3 h-3 text-teal-700" />
            <span>Siap Antar / Ambil</span>
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Selesai</span>
          </span>
        );
      case "DIBATALKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-900 border border-red-200 text-[11px] font-bold shrink-0">
            <AlertCircle className="w-3 h-3 text-red-700" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium shrink-0">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = recentOrders.filter((ord) => {
    if (!orderSearchTerm.trim()) return true;
    const term = orderSearchTerm.toLowerCase();
    return (
      ord.orderCode.toLowerCase().includes(term) ||
      ord.customerName.toLowerCase().includes(term) ||
      ord.customerPhone.includes(term)
    );
  });

  const maxWeeklyRevenue = Math.max(...(weeklyTrend.map((d) => d.revenue) || [1]), 50000);
  const maxWeeklyOrders = Math.max(...(weeklyTrend.map((d) => d.orderCount) || [1]), 5);

  const totalWeeklyRevenue = weeklyTrend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalWeeklyOrders = weeklyTrend.reduce((acc, curr) => acc + curr.orderCount, 0);

  return (
    <div className="space-y-6 animate-fadeIn font-sans max-w-7xl mx-auto w-full min-w-0">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & GREETING BANNER                                */}
      {/* ============================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Admin Portal</span>
            <span>/</span>
            <span className="text-[#4A0E4E] font-bold">Ringkasan Operasional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Dashboard Operasional & Penjualan Toko
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Kelola pesanan dapur, pantau stok kue, dan monitor performa penjualan Dapur Rasa secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={fetchOverviewData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Segarkan data terbaru"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#4A0E4E]" : "text-slate-600"}`} />
            <span>{isRefreshing ? "Menyegarkan..." : "Segarkan"}</span>
          </button>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A0E4E] hover:bg-[#3D0840] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kue Baru</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KEY STATS METRIC CARDS (4 Kolom Rapi & Terkunci di Kotak)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pendapatan / Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Total Pendapatan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
              <Wallet className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3.5 min-w-0">
            <span
              className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block truncate"
              title={formatPrice(metrics?.confirmedRevenue || 0)}
            >
              {isLoading ? "..." : formatPrice(metrics?.confirmedRevenue || 0)}
            </span>
            <div className="flex items-center gap-1.5 mt-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold shrink-0">
                <TrendingUp className="w-3 h-3" />
                <span>Valid</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Pesanan terkonfirmasi</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pesanan Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Pesanan Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#4A0E4E] flex items-center justify-center border border-purple-100 shrink-0">
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3.5 min-w-0">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block truncate">
              {isLoading ? "..." : `${metrics?.totalOrders || 0} Pesanan`}
            </span>
            <div className="flex items-center gap-1.5 mt-2 min-w-0">
              {metrics?.statusCounts.MENUNGGU_KONFIRMASI ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold truncate">
                  {metrics.statusCounts.MENUNGGU_KONFIRMASI} Butuh Konfirmasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium truncate">
                  Terkonfirmasi semua
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Produk Aktif & Menu Kue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Menu Kue Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
              <Package className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3.5 min-w-0">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block truncate">
              {isLoading ? "..." : `${metrics?.activeProducts || 0} Menu`}
            </span>
            <div className="flex items-center gap-1.5 mt-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold shrink-0">
                {metrics?.categoriesCount || 0} Kategori
              </span>
              <span className="text-[11px] text-slate-400 truncate">Total {metrics?.totalProducts || 0} kue</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pengantaran & Area Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Wilayah Antar
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
              <Truck className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3.5 min-w-0">
            <span
              className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block truncate"
              title="Perum Griya Cileungsi 5"
            >
              Griya Cileungsi 5
            </span>
            <div className="flex items-center gap-1.5 mt-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold shrink-0">
                Prioritas
              </span>
              <span className="text-[11px] text-slate-400 truncate">Area Dapur & Antar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ALUR STATUS PESANAN (Kompak, Bersih & Pas di Dalam Kotak)   */}
      {/* ============================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 min-w-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-xs sm:text-sm text-slate-800">
              Pintasan Status Pesanan Masuk
            </span>
          </div>
          <Link
            href="/admin/orders"
            className="text-[11px] font-bold text-[#4A0E4E] hover:underline flex items-center gap-0.5"
          >
            <span>Semua Pesanan</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grid 4 Kolom Rapi (2 Kolom di Mobile, 4 di Tablet/Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/admin/orders?status=MENUNGGU_KONFIRMASI"
            className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs transition border border-amber-200 shadow-2xs min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="truncate">Menunggu</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-white text-amber-800 text-[11px] font-extrabold shadow-2xs shrink-0 ml-1">
              {metrics?.statusCounts.MENUNGGU_KONFIRMASI || 0}
            </span>
          </Link>

          <Link
            href="/admin/orders?status=SEDANG_DIPROSES"
            className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-xs transition border border-purple-200 shadow-2xs min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Cake className="w-4 h-4 text-purple-700 shrink-0" />
              <span className="truncate">Diproses</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-white text-purple-800 text-[11px] font-extrabold shadow-2xs shrink-0 ml-1">
              {metrics?.statusCounts.SEDANG_DIPROSES || 0}
            </span>
          </Link>

          <Link
            href="/admin/orders?status=SIAP_DIKIRIM"
            className="flex items-center justify-between p-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 font-bold text-xs transition border border-teal-200 shadow-2xs min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Truck className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="truncate">Siap Antar</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-white text-teal-800 text-[11px] font-extrabold shadow-2xs shrink-0 ml-1">
              {(metrics?.statusCounts.SIAP_DIAMBIL || 0) + (metrics?.statusCounts.SIAP_DIKIRIM || 0)}
            </span>
          </Link>

          <Link
            href="/admin/orders?status=SELESAI"
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs transition border border-emerald-200 shadow-2xs min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">Selesai</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-white text-emerald-800 text-[11px] font-extrabold shadow-2xs shrink-0 ml-1">
              {metrics?.statusCounts.SELESAI || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. GRAFIK TREN PENJUALAN & DISTRIBUSI KATEGORI                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left Column: Weekly Sales & Orders Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4A0E4E]" />
                <span>Tren Penjualan 7 Hari Terakhir</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Akumulasi omset dan frekuensi pesanan harian.
              </p>
            </div>

            {/* Toggle view: Revenue vs Order Count */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMode("revenue")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMode === "revenue"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Omset (Rp)
              </button>
              <button
                type="button"
                onClick={() => setChartMode("orders")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMode === "orders"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pesanan
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization (Kompak & Responsif) */}
          <div className="h-44 pt-2 flex items-end justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-2 overflow-x-auto min-w-0">
            {weeklyTrend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Memuat data grafik tren penjualan...
              </div>
            ) : (
              weeklyTrend.map((day, idx) => {
                const value = chartMode === "revenue" ? day.revenue : day.orderCount;
                const maxValue = chartMode === "revenue" ? maxWeeklyRevenue : maxWeeklyOrders;
                const percentHeight = Math.max(Math.round((value / maxValue) * 100), 8);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group min-w-[34px]">
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-28">
                      <div
                        style={{ height: `${percentHeight}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          chartMode === "revenue"
                            ? "bg-gradient-to-t from-[#4A0E4E] to-[#7B1882] group-hover:from-amber-600 group-hover:to-amber-400"
                            : "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-purple-700 group-hover:to-purple-500"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="block text-[11px] font-bold text-slate-800">{day.dayName}</span>
                      <span className="block text-[9.5px] text-slate-400">{day.date.slice(5).replace("-", "/")}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="truncate">
              Total 7 Hari: <strong>{formatPrice(totalWeeklyRevenue)}</strong> ({totalWeeklyOrders} pesanan)
            </span>
            <span className="text-[10.5px] text-slate-400 shrink-0">Real-time DB</span>
          </div>
        </div>

        {/* Right Column: Top Categories (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Distribusi Kategori Produk</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Koleksi kue aktif per kategori.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-[#4A0E4E] hover:underline flex items-center gap-0.5"
            >
              <span>Kelola</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {topCategories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada data kategori.
              </div>
            ) : (
              topCategories.slice(0, 5).map((cat, idx) => {
                const colors = [
                  "bg-amber-500",
                  "bg-[#4A0E4E]",
                  "bg-purple-600",
                  "bg-emerald-600",
                  "bg-blue-600",
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.id} className="space-y-1 text-xs min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-slate-800 truncate">{cat.name}</span>
                      <span className="font-semibold text-slate-500 shrink-0">
                        {cat._count.products} Kue
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-lg overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            Math.round(
                              (cat._count.products / (metrics?.totalProducts || 1)) * 100
                            ),
                            100
                          )}%`,
                        }}
                        className={`h-full rounded-lg ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block mb-0.5">Catatan Dapur:</span>
            Pastel Crispy dan Risol Mayo menjadi varian kue terlaris dengan permintaan harian tertinggi di Griya Cileungsi 5.
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. TABEL TRANSAKSI & PESANAN TERBARU (Rapi & Bebas Keluar Kotak)*/}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#4A0E4E]" />
              <span>Transaksi & Pesanan Terbaru</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar pesanan masuk yang dibuat pelanggan melalui website.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / nomor..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A0E4E] w-40 sm:w-52"
              />
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#4A0E4E] hover:text-[#5C1261] inline-flex items-center gap-1 shrink-0"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            {orderSearchTerm ? "Tidak ada pesanan yang cocok dengan pencarian." : "Belum ada transaksi pesanan tercatat."}
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
            <table className="w-full min-w-[960px] text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3.5 w-28 whitespace-nowrap">No. Ref</th>
                  <th className="py-3 px-3 w-32 whitespace-nowrap">Waktu</th>
                  <th className="py-3 px-3 min-w-[140px]">Pelanggan</th>
                  <th className="py-3 px-3 min-w-[140px]">Metode & Alamat</th>
                  <th className="py-3 px-3 min-w-[140px]">Item Kue</th>
                  <th className="py-3 px-3 w-32 whitespace-nowrap">Total Tagihan</th>
                  <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 text-right w-28 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const isDelivery = ord.fulfillmentType === "DELIVERY";

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {ord.orderCode}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 max-w-[140px] truncate" title={ord.customerName}>
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="space-y-1.5 min-w-[190px]">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 whitespace-nowrap">
                            {isDelivery ? (
                              <>
                                <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                                  <Truck className="w-3 h-3" />
                                </div>
                                <span>Diantar</span>
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
                          {isDelivery && ord.deliveryAddress && (
                            <div className="flex items-start gap-1 text-[10.5px] text-slate-500 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate max-w-[160px]" title={ord.deliveryAddress}>
                                {ord.deliveryAddress}
                              </span>
                            </div>
                          )}
                          <div className="pt-0.5">
                            {formatPaymentBadge(ord.paymentMethod, ord.fulfillmentType)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="font-semibold text-slate-800 whitespace-nowrap block">
                          {ord.items?.length || 0} Macam Kue
                        </span>
                        {ord.items?.[0] && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px] mt-0.5" title={ord.items[0].productName}>
                            {ord.items[0].productName} x {ord.items[0].quantity}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap font-mono">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/62${ord.customerPhone.replace(/^0/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/orders?search=${ord.orderCode}`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </Link>
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
      {/* 6. PERINGATAN STOK MINIM & PINTASAN MENU CEPAT                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
        {/* Card 1: Peringatan Stok Kue Minim */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">Peringatan Inventaris Stok</h3>
                <p className="text-[11px] text-slate-400 truncate">Kue dengan sisa stok minim (≤ 15 pcs)</p>
              </div>
            </div>
            <Link
              href="/admin/stock"
              className="text-xs font-bold text-[#4A0E4E] hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span>Atur Stok</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-medium text-center">
                ✅ Seluruh stok kue saat ini dalam batas aman.
              </div>
            ) : (
              lowStockProducts.slice(0, 4).map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs gap-2.5 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block truncate" title={prod.name}>
                      {prod.name}
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      {formatPrice(prod.price)} / {prod.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        prod.stock <= 5
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Sisa {prod.stock} {prod.unit}
                    </span>
                    <Link
                      href="/admin/stock"
                      className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-md font-bold text-[10.5px] text-slate-700 shadow-2xs"
                    >
                      + Stok
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Pintasan Menu Pengelolaan Cepat */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">Pusat Pintasan Cepat</h3>
                <p className="text-[11px] text-slate-400 truncate">Akses cepat menu pengelolaan toko</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/admin/products"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#4A0E4E]/40 hover:bg-purple-50/20 transition-all flex flex-col justify-between group min-w-0 h-24 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <Cake className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#4A0E4E] truncate">
                  Katalog Kue
                </span>
                <span className="text-[10.5px] text-slate-400 block mt-0.5 truncate">
                  Tambah & harga kue
                </span>
              </div>
            </Link>

            <Link
              href="/admin/homepage"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#4A0E4E]/40 hover:bg-purple-50/20 transition-all flex flex-col justify-between group min-w-0 h-24 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
                <Palette className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#4A0E4E] truncate">
                  Banner Beranda
                </span>
                <span className="text-[10.5px] text-slate-400 block mt-0.5 truncate">
                  Atur slider promo
                </span>
              </div>
            </Link>

            <Link
              href="/admin/gallery"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#4A0E4E]/40 hover:bg-purple-50/20 transition-all flex flex-col justify-between group min-w-0 h-24 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#4A0E4E] truncate">
                  Galeri Foto
                </span>
                <span className="text-[10.5px] text-slate-400 block mt-0.5 truncate">
                  Upload foto kue asli
                </span>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#4A0E4E]/40 hover:bg-purple-50/20 transition-all flex flex-col justify-between group min-w-0 h-24 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#4A0E4E] truncate">
                  Pengaturan
                </span>
                <span className="text-[10.5px] text-slate-400 block mt-0.5 truncate">
                  Nomor WA & sandi admin
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

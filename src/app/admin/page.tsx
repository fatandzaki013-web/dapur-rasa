"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  Package,
  Truck,
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
  MapPin,
  Calendar,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU_KONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Menunggu Konfirmasi</span>
          </span>
        );
      case "DIKONFIRMASI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>Dikonfirmasi</span>
          </span>
        );
      case "SEDANG_DIPROSES":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold">
            <Cake className="w-3 h-3 text-purple-700" />
            <span>Diproses Dapur</span>
          </span>
        );
      case "SIAP_DIAMBIL":
      case "SIAP_DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-bold">
            <Truck className="w-3 h-3 text-teal-700" />
            <span>Siap Antar / Ambil</span>
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Selesai</span>
          </span>
        );
      case "DIBATALKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-900 border border-red-200 text-[11px] font-bold">
            <AlertCircle className="w-3 h-3 text-red-700" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
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

  // Calculate highest revenue in weekly trend for scaling the chart
  const maxWeeklyRevenue = Math.max(...(weeklyTrend.map((d) => d.revenue) || [1]), 50000);
  const maxWeeklyOrders = Math.max(...(weeklyTrend.map((d) => d.orderCount) || [1]), 5);

  const totalWeeklyRevenue = weeklyTrend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalWeeklyOrders = weeklyTrend.reduce((acc, curr) => acc + curr.orderCount, 0);

  return (
    <div className="space-y-7 animate-fadeIn font-sans">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & GREETING BANNER (Sahabat Qolbu Style)          */}
      {/* ============================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#0A2544] font-bold">Dashboard Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Operasional &amp; Penjualan Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Selamat datang di pusat pengelolaan <strong>Dapur Rasa</strong>. Pantau transaksi pesanan kue, ketersediaan inventaris, dan performa harian secara terpadu.
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
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#0A2544]" : "text-slate-600"}`} />
            <span>{isRefreshing ? "Menyegarkan..." : "Segarkan"}</span>
          </button>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A2544] hover:bg-[#12365e] text-white text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kue Baru</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KEY STATS METRIC CARDS (4 Cards Grid)                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Pendapatan / Omset */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Wallet className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading ? "..." : formatPrice(metrics?.confirmedRevenue || 0)}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>Valid</span>
              </span>
              <span className="text-[11px] text-slate-400">Dari pesanan terkonfirmasi</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pesanan Masuk */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pesanan Masuk
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4A0E4E] flex items-center justify-center border border-purple-100">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading ? "..." : `${metrics?.totalOrders || 0} Pesanan`}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {metrics?.statusCounts.MENUNGGU_KONFIRMASI ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold">
                  {metrics.statusCounts.MENUNGGU_KONFIRMASI} Butuh Konfirmasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  Terkonfirmasi semua
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Produk Aktif & Menu Kue */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menu Kue Aktif
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Package className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading ? "..." : `${metrics?.activeProducts || 0} Menu`}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
                {metrics?.categoriesCount || 0} Kategori
              </span>
              <span className="text-[11px] text-slate-400">Total {metrics?.totalProducts || 0} produk</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pengantaran & Area Operasional */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Wilayah Pengantaran
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Truck className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block truncate">
              Griya Cileungsi 5
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                Prioritas Kurir
              </span>
              <span className="text-[11px] text-slate-400">&amp; Ambil di Toko</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. OPERATIONAL PIPELINE (Status Filter Bar)                    */}
      {/* ============================================================== */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-800">Alur Status Pesanan Dapur:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/orders?status=MENUNGGU_KONFIRMASI"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition border border-amber-200"
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Menunggu: {metrics?.statusCounts.MENUNGGU_KONFIRMASI || 0}</span>
          </Link>

          <Link
            href="/admin/orders?status=SEDANG_DIPROSES"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition border border-purple-200"
          >
            <Cake className="w-3.5 h-3.5 text-purple-700" />
            <span>Diproses Dapur: {metrics?.statusCounts.SEDANG_DIPROSES || 0}</span>
          </Link>

          <Link
            href="/admin/orders?status=SIAP_DIAMBIL"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold transition border border-teal-200"
          >
            <Truck className="w-3.5 h-3.5 text-teal-700" />
            <span>
              Siap: {(metrics?.statusCounts.SIAP_DIAMBIL || 0) + (metrics?.statusCounts.SIAP_DIKIRIM || 0)}
            </span>
          </Link>

          <Link
            href="/admin/orders?status=SELESAI"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold transition border border-emerald-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Selesai: {metrics?.statusCounts.SELESAI || 0}</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. VISUAL ANALYTICS: 7-DAY SALES & CATEGORY DISTRIBUTION       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Sales & Orders Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0A2544]" />
                <span>Tren Penjualan 7 Hari Terakhir</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi omset dan frekuensi pesanan harian.
              </p>
            </div>

            {/* Toggle view: Revenue vs Order Count */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
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
                Volume Pesanan
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 pt-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-2">
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
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xs">
                      {chartMode === "revenue" ? formatPrice(day.revenue) : `${day.orderCount} pesanan`}
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-40">
                      <div
                        style={{ height: `${percentHeight}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          chartMode === "revenue"
                            ? "bg-gradient-to-t from-[#0A2544] to-[#1E4E8C] group-hover:from-amber-600 group-hover:to-amber-400"
                            : "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-purple-700 group-hover:to-purple-500"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-slate-800">{day.dayName}</span>
                      <span className="block text-[10px] text-slate-400">{day.date.slice(5)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Total 7 Hari: <strong>{formatPrice(totalWeeklyRevenue)}</strong> ({totalWeeklyOrders} pesanan)
            </span>
            <span className="text-[11px] text-slate-400">Diperbarui real-time dari database</span>
          </div>
        </div>

        {/* Right Column: Top Categories & Product Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EAB308]" />
                <span>Distribusi Kategori Produk</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Koleksi kue aktif per kategori.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-[#0A2544] hover:underline flex items-center gap-0.5"
            >
              <span>Kelola</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 pt-1">
            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada data kategori.
              </div>
            ) : (
              topCategories.map((cat, idx) => {
                const colors = [
                  "bg-amber-500",
                  "bg-[#0A2544]",
                  "bg-purple-600",
                  "bg-emerald-600",
                  "bg-blue-600",
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-semibold text-slate-500">
                        {cat._count.products} Produk
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            Math.round(
                              (cat._count.products / (metrics?.totalProducts || 1)) * 100
                            ),
                            100
                          )}%`,
                        }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Informasi Menu Toko:</span>
            <p>
              Pastel Crispy, Risol Mayo, dan Brownies Bolu menjadi produk dengan permintaan harian tertinggi di area Perum Griya Cileungsi 5.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. RECENT ORDERS TABLE (Transaksi & Pesanan Terbaru)           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0A2544]" />
              <span>Transaksi &amp; Pesanan Terbaru</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar pesanan masuk yang dibuat melalui website Dapur Rasa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / no. WA..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A2544]/20 w-44 sm:w-56"
              />
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#0A2544] hover:text-[#164475] inline-flex items-center gap-1 shrink-0"
            >
              <span>Buka Semua Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            {orderSearchTerm ? "Tidak ada pesanan yang cocok dengan pencarian." : "Belum ada transaksi pesanan tercatat."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">No. Referensi</th>
                  <th className="py-2.5 px-3">Waktu Pesan</th>
                  <th className="py-2.5 px-3">Data Pemesan</th>
                  <th className="py-2.5 px-3">Metode Ambil / Antar</th>
                  <th className="py-2.5 px-3">Item Pesanan</th>
                  <th className="py-2.5 px-3">Total Tagihan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const isDelivery = ord.fulfillmentType === "DELIVERY";

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {ord.orderCode}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="flex items-center gap-1 font-semibold">
                          {isDelivery ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-[#0A2544]" />
                              <span>Diantar ke Rumah</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Ambil di Dapur</span>
                            </>
                          )}
                        </div>
                        {isDelivery && ord.deliveryAddress && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={ord.deliveryAddress}>
                            {ord.deliveryAddress}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {ord.items?.length || 0} Macam Kue
                        </span>
                        {ord.items?.[0] && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            {ord.items[0].productName} x {ord.items[0].quantity}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/62${ord.customerPhone.replace(/^0/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/orders?search=${ord.orderCode}`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition text-[11px] flex items-center gap-1"
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
      {/* 6. BOTTOM ROW: INVENTORY ALERT & QUICK STORE SHORTCUTS         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Peringatan Stok Kue Minim */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Peringatan Inventaris Stok</h3>
                <p className="text-[11px] text-slate-400">Kue dengan sisa stok minim (&le; 15 pcs)</p>
              </div>
            </div>
            <Link
              href="/admin/stock"
              className="text-xs font-bold text-[#0A2544] hover:underline flex items-center gap-0.5"
            >
              <span>Kelola Stok</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-medium text-center">
                ✅ Seluruh stok kue saat ini dalam batas aman.
              </div>
            ) : (
              lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{prod.name}</span>
                    <span className="text-[11px] text-slate-400">{formatPrice(prod.price)} / {prod.unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        prod.stock <= 5
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Sisa {prod.stock} {prod.unit}
                    </span>
                    <Link
                      href="/admin/stock"
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-[11px] text-slate-700 shadow-2xs"
                    >
                      + Stok
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Pintasan Pengelolaan Cepat (Shortcuts) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pusat Pintasan Cepat</h3>
                <p className="text-[11px] text-slate-400">Akses langsung ke menu pengelolaan utama</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href="/admin/products"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-2">
                <Cake className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#0A2544]">
                  Katalog Kue
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Tambah &amp; atur harga kue
                </span>
              </div>
            </Link>

            <Link
              href="/admin/homepage"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center mb-2">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#0A2544]">
                  Visual Homepage
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Ganti banner &amp; promo
                </span>
              </div>
            </Link>

            <Link
              href="/admin/gallery"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#0A2544]">
                  Galeri Foto
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Upload dokumentasi kue
                </span>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-2">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs group-hover:text-[#0A2544]">
                  Pengaturan
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Nomor WA &amp; sandi admin
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

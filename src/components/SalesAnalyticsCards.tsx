"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  PackageCheck,
  Flame,
  Award,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { supabase, SupabaseOrder, parseOrderItems } from "@/lib/supabase";

type TimeRange = "ALL" | "THIS_MONTH" | "TODAY";

interface SalesAnalyticsCardsProps {
  activeProductsCount?: number;
  totalProductsCount?: number;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SalesAnalyticsCards({
  activeProductsCount: propActiveProducts,
  totalProductsCount: propTotalProducts,
}: SalesAnalyticsCardsProps) {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [activeMenuCount, setActiveMenuCount] = useState<number>(propActiveProducts ?? 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");

  // Load orders and active products count from Supabase
  const loadAnalyticsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.warn("Gagal menarik data pesanan untuk analitik:", ordersError);
      } else {
        setOrders(ordersData || []);
      }

      // 2. Fetch Active Products Count if not passed via props
      if (propActiveProducts === undefined) {
        const { count, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_available", true);

        if (!productsError && typeof count === "number") {
          setActiveMenuCount(count);
        }
      }
    } catch (err) {
      console.error("Kesalahan fetch analitik penjualan:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [propActiveProducts]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Sync if propActiveProducts updates from catalog parent
  useEffect(() => {
    if (propActiveProducts !== undefined) {
      setActiveMenuCount(propActiveProducts);
    }
  }, [propActiveProducts]);

  // Filter orders by selected time range
  const filteredOrders = useMemo(() => {
    if (timeRange === "ALL") return orders;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    return orders.filter((order) => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);
      if (isNaN(orderDate.getTime())) return false;

      if (timeRange === "TODAY") {
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getDate() === currentDate
        );
      }

      if (timeRange === "THIS_MONTH") {
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() === currentMonth
        );
      }

      return true;
    });
  }, [orders, timeRange]);

  // 1. Total Pendapatan (Omset): Sum of total_price from completed orders ("selesai")
  const completedOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) => (o.status || "").toLowerCase() === "selesai"
    );
  }, [filteredOrders]);

  const totalRevenue = useMemo(() => {
    return completedOrders.reduce(
      (acc, curr) => acc + (Number(curr.total_price) || 0),
      0
    );
  }, [completedOrders]);

  // 2. Total Pesanan Masuk
  const totalOrdersCount = filteredOrders.length;

  // 3. Pesanan Perlu Diproses (Pending)
  const pendingOrdersCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
  }, [filteredOrders]);

  // 4. Menu Terlaris (Top 3-5 items from completed orders)
  const topSellingItems = useMemo(() => {
    const itemMap: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    for (const order of completedOrders) {
      const items = parseOrderItems(order.items);
      for (const item of items) {
        const name = (item.name || "Menu").trim();
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;

        if (!itemMap[name]) {
          itemMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemMap[name].quantity += qty;
        itemMap[name].revenue += price * qty;
      }
    }

    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [completedOrders]);

  const highestQuantity = topSellingItems[0]?.quantity || 1;

  const timeRangeLabel =
    timeRange === "TODAY"
      ? "Hari Ini"
      : timeRange === "THIS_MONTH"
      ? "Bulan Ini"
      : "Semua Waktu";

  return (
    <section aria-label="Analitik Penjualan" className="space-y-4">
      {/* ============================================================== */}
      {/* 1. SECTION HEADER & QUICK TIME FILTER                          */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider border border-emerald-200/60">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Analitik Real-Time</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Data tabel <code>public.orders</code>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Ringkasan Analitik Penjualan
          </h2>
        </div>

        {/* Filter Waktu Sederhana */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setTimeRange("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === "ALL"
                  ? "bg-[#4A0E4E] text-white shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Semua Waktu
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("THIS_MONTH")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === "THIS_MONTH"
                  ? "bg-[#4A0E4E] text-white shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("TODAY")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === "TODAY"
                  ? "bg-[#4A0E4E] text-white shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Hari Ini
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadAnalyticsData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Segarkan data analitik"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#4A0E4E]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KARTU METRIK UTAMA (4 STAT CARDS)                          */}
      {/* ============================================================== */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-7 w-32 bg-slate-300 rounded" />
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KARTU 1: Total Pendapatan (Omset Selesai) */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Total Pendapatan (Omset)
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-heading tracking-tight">
                {formatIDR(totalRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {completedOrders.length} pesanan selesai ({timeRangeLabel})
                </span>
              </div>
            </div>
          </div>

          {/* KARTU 2: Total Pesanan Masuk */}
          <Link
            href="/admin/orders"
            className="group bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:border-purple-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Pesanan Masuk
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4A0E4E] group-hover:bg-[#4A0E4E] group-hover:text-white flex items-center justify-center shadow-xs shrink-0 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
                {totalOrdersCount}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">Pesanan</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500 font-medium">
                <span>Semua status ({timeRangeLabel})</span>
                <span className="text-[#4A0E4E] font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Kelola <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* KARTU 3: Pesanan Perlu Diproses (Pending - Aksen Oranye) */}
          <Link
            href="/admin/orders"
            className={`group p-5 rounded-2xl shadow-xs flex flex-col justify-between transition-all ${
              pendingOrdersCount > 0
                ? "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white border-2 border-amber-400/90 ring-4 ring-amber-400/10 hover:border-amber-500"
                : "bg-white border border-slate-200/80 hover:bg-slate-50/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  pendingOrdersCount > 0 ? "text-amber-900 font-extrabold" : "text-slate-500"
                }`}
              >
                {pendingOrdersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                )}
                <span>Perlu Diproses</span>
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 transition-colors ${
                  pendingOrdersCount > 0
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {pendingOrdersCount > 0 ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl sm:text-3xl font-black font-heading tracking-tight ${
                  pendingOrdersCount > 0 ? "text-amber-950" : "text-slate-900"
                }`}
              >
                {pendingOrdersCount}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">Pending</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs font-semibold">
                {pendingOrdersCount > 0 ? (
                  <>
                    <span className="text-amber-800">⚡ Butuh konfirmasi segera</span>
                    <span className="text-amber-900 underline inline-flex items-center gap-0.5">
                      Buka <ArrowRight className="w-3 h-3" />
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-700">Semua pesanan aman terproses</span>
                )}
              </div>
            </div>
          </Link>

          {/* KARTU 4: Total Menu Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Menu Aktif
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
                {activeMenuCount}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">Menu</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-blue-700 font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Siap dipesan pembeli di web</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BAGIAN MENU TERLARIS (TOP SELLING ITEMS)                   */}
      {/* ============================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                Menu Terlaris (Top Selling Items)
              </h3>
              <p className="text-[11px] text-slate-500">
                Peringkat menu paling sering dipesan berdasarkan pesanan berstatus &quot;selesai&quot; ({timeRangeLabel}).
              </p>
            </div>
          </div>
          {topSellingItems.length > 0 && (
            <span className="text-xs text-slate-500 font-medium self-start sm:self-auto">
              Total {topSellingItems.reduce((acc, it) => acc + it.quantity, 0)} item terjual
            </span>
          )}
        </div>

        {/* List of top items or fallback state */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl animate-pulse space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-2 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : topSellingItems.length === 0 ? (
          /* Fallback State */
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Belum ada data transaksi menu</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Data menu terlaris akan otomatis terisi dan diperbarui saat ada pesanan masuk yang statusnya diubah menjadi &quot;selesai&quot; di{" "}
              <Link href="/admin/orders" className="text-[#4A0E4E] font-bold underline">
                Halaman Pesanan
              </Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topSellingItems.map((item, index) => {
              const rank = index + 1;
              const percentage = Math.round((item.quantity / highestQuantity) * 100);

              return (
                <div
                  key={item.name}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Badge */}
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? "bg-amber-400 text-amber-950 shadow-2xs"
                            : rank === 2
                            ? "bg-slate-300 text-slate-800 shadow-2xs"
                            : rank === 3
                            ? "bg-amber-700/80 text-amber-50 shadow-2xs"
                            : "bg-slate-200 text-slate-600 font-bold"
                        }`}
                      >
                        {rank === 1 ? "1" : rank === 2 ? "2" : rank === 3 ? "3" : rank}
                      </span>
                      <span className="font-extrabold text-slate-900 truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="font-bold text-[#4A0E4E]">
                        {item.quantity}{" "}
                        <span className="text-[11px] font-normal text-slate-500">terjual</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 font-mono hidden sm:inline">
                        {formatIDR(item.revenue)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Visualizing Market Share */}
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rank === 1
                          ? "bg-gradient-to-r from-amber-500 to-[#4A0E4E]"
                          : rank === 2
                          ? "bg-gradient-to-r from-purple-500 to-[#4A0E4E]"
                          : "bg-[#4A0E4E]/80"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

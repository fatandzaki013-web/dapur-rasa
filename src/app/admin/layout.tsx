"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  BookOpen,
  Palette,
  MessageSquareQuote,
  TrendingUp,
  Settings,
  Database,
  FileText,
  ChevronRight,
  ChevronDown,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

// Brand Logo: Golden & dark navy teardrop emblem with clean golden spark
function BrandLogoIcon() {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-9 h-9 shrink-0 drop-shadow-xs"
    >
      <path
        d="M18 3C18 3 8 13.5 8 22.5C8 28 12.5 32.5 18 32.5C23.5 32.5 28 28 28 22.5C28 13.5 18 3 18 3Z"
        fill="#F59E0B"
      />
      <path
        d="M19 6C19 6 12.5 15.5 12.5 22.5C12.5 25.8 15 28.5 18 28.5C21 28.5 23.5 25.8 23.5 22.5C23.5 16.5 19 6 19 6Z"
        fill="#0F172A"
      />
      <circle cx="18" cy="23.5" r="2.2" fill="#FBBF24" />
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Group paths
  const isMasterPath =
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/stock");

  const isContentPath =
    pathname.startsWith("/admin/content") ||
    pathname.startsWith("/admin/articles") ||
    pathname.startsWith("/admin/homepage") ||
    pathname.startsWith("/admin/theme") ||
    pathname.startsWith("/admin/testimonials-faq");

  const [isDataMasterOpen, setIsDataMasterOpen] = useState<boolean>(isMasterPath || true);
  const [isKontenOpen, setIsKontenOpen] = useState<boolean>(isContentPath || true);

  // Skip auth check on the login page itself
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    // Jika adminUser sudah ada di memori sesi, jangan blocking navigasi
    if (adminUser) {
      setIsCheckingAuth(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setIsCheckingAuth(false);
      controller.abort();
    }, 2000);

    fetch("/api/auth/me", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
        } else {
          router.push("/admin/login");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          router.push("/admin/login");
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsCheckingAuth(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Memeriksa Sesi Admin...</span>
        </div>
      </div>
    );
  }

  // 1. Menu Utama Toko Dapur Rasa (100% Unik & Berfungsi, Tanpa Duplikasi)
  const primaryMenuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutGrid, exact: true },
    { label: "Kelola Produk & Kue", href: "/admin/products", icon: Package },
    { label: "Kelola Pesanan", href: "/admin/orders", icon: ShoppingBag },
    { label: "Galeri Foto Kue", href: "/admin/gallery", icon: ImageIcon },
  ];

  // 2. Data Master (Kategori & Stok Inventaris)
  const dataMasterItems = [
    { label: "Kategori Produk", href: "/admin/categories", icon: Layers },
    { label: "Manajemen Stok", href: "/admin/stock", icon: TrendingUp },
  ];

  // 3. Konten & Tampilan Web (Artikel Kuliner, Banner Slider Beranda, Testimoni & FAQ)
  const kontenItems = [
    { label: "Artikel & Tips Kuliner", href: "/admin/content/articles", icon: BookOpen },
    { label: "Warna & Tema Website", href: "/admin/theme", icon: Palette },
    { label: "Tampilan Beranda (Banner)", href: "/admin/homepage", icon: Layers },
    { label: "Testimoni & FAQ", href: "/admin/testimonials-faq", icon: MessageSquareQuote },
  ];

  // 4. Pengaturan Toko
  const settingsMenuItem = {
    label: "Pengaturan Toko & Sandi",
    href: "/admin/settings",
    icon: Settings,
  };

  const isDataMasterActive = dataMasterItems.some((it) => pathname === it.href);
  const isKontenActive =
    kontenItems.some((it) => pathname === it.href) ||
    pathname.startsWith("/admin/content") ||
    pathname.startsWith("/admin/articles");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans">
      {/* ============================================================== */}
      {/* SIDEBAR DESKTOP: Estetika Putih Bersih Khusus Dapur Rasa       */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 bg-white text-slate-700 flex-col shrink-0 border-r border-slate-200/90 shadow-2xs select-none">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <BrandLogoIcon />
          <div>
            <div className="text-[17px] leading-tight flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight">Dapur</span>
              <span className="font-extrabold text-[#EAB308] tracking-tight">Rasa</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Dashboard ADMIN
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable dengan scrollbar halus) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto sidebar-scrollbar">
          {/* Menu Utama */}
          {primaryMenuItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0 stroke-[1.8] text-slate-700" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Accordion 1: Data Master */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsDataMasterOpen(!isDataMasterOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${
                isDataMasterActive
                  ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Database className="w-5 h-5 shrink-0 stroke-[1.8] text-slate-700" />
                <span>Data Master</span>
              </div>
              {isDataMasterOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isDataMasterOpen && (
              <div className="mt-1 ml-5 pl-3 border-l-2 border-slate-200 space-y-1 animate-fadeIn">
                {dataMasterItems.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSubActive
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <SubIcon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accordion 2: Konten & Tampilan Web */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsKontenOpen(!isKontenOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${
                isKontenActive
                  ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <FileText className="w-5 h-5 shrink-0 stroke-[1.8] text-slate-700" />
                <span>Konten &amp; Web</span>
              </div>
              {isKontenOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isKontenOpen && (
              <div className="mt-1 ml-5 pl-3 border-l-2 border-slate-200 space-y-1 animate-fadeIn">
                {kontenItems.map((sub) => {
                  const isSubActive =
                    pathname === sub.href ||
                    (sub.href === "/admin/content/articles" && pathname.startsWith("/admin/content/articles"));
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSubActive
                          ? "bg-amber-50 text-amber-900 font-bold border border-amber-200/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? "text-amber-600" : "text-slate-500"}`} />
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pengaturan Toko & Sandi */}
          <div className="pt-1">
            <Link
              href={settingsMenuItem.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                pathname === settingsMenuItem.href
                  ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Settings className="w-5 h-5 shrink-0 stroke-[1.8] text-slate-700" />
              <span className="truncate">{settingsMenuItem.label}</span>
            </Link>
          </div>
        </nav>

        {/* User Card & Logout Footer (Email disesuaikan dengan website Dapur Rasa) */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full bg-[#FEF9C3] text-slate-800 font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
              S
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {adminUser?.name || "Super Admin"}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                admin@dapurrasa.com
              </div>
            </div>
          </div>

          {/* Outlined Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-700" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Buka Menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-heading font-bold text-slate-800 text-base hidden sm:inline">
              Pusat Pengelolaan Dapur Rasa
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/artikel"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Lihat Artikel Web</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <span>Lihat Toko Pelanggan</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex">
            <div className="w-64 bg-white text-slate-700 flex flex-col h-full shadow-2xl animate-fadeIn">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrandLogoIcon />
                  <div>
                    <div className="text-base font-extrabold text-slate-900 leading-tight">
                      Dapur <span className="text-[#EAB308]">Rasa</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">
                      Dashboard ADMIN
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items Mobile */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto sidebar-scrollbar">
                {primaryMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.8] text-slate-700" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Data Master Mobile */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-3 block">
                    Data Master
                  </span>
                  {dataMasterItems.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        pathname === sub.href
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <sub.icon className="w-4 h-4 text-slate-500" />
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Konten Mobile */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-3 block">
                    Konten &amp; Web
                  </span>
                  {kontenItems.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        pathname === sub.href
                          ? "bg-amber-50 text-amber-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <sub.icon className="w-4 h-4 text-slate-500" />
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Pengaturan Mobile */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <Link
                    href={settingsMenuItem.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                      pathname === settingsMenuItem.href
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>{settingsMenuItem.label}</span>
                  </Link>
                </div>
              </nav>

              {/* Profile & Logout Mobile */}
              <div className="p-4 border-t border-slate-100 bg-white space-y-2.5">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-9 h-9 rounded-full bg-[#FEF9C3] text-slate-800 font-bold text-sm flex items-center justify-center shrink-0">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {adminUser?.name || "Super Admin"}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">admin@dapurrasa.com</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-700" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}

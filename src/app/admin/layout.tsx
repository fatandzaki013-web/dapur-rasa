"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  BookOpen,
  Palette,
  HelpCircle,
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
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Brand Logo: Golden & dark plum teardrop emblem with cake icon
function BrandLogoIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-[#4A0E4E] text-white flex items-center justify-center shadow-xs font-bold text-lg shrink-0">
      🧁
    </div>
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

    let isMounted = true;

    // 1. Cek sesi Supabase saat pertama kali mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;

      if (error || !session || !session.user) {
        // Tidak ada sesi yang valid -> hapus cookie sesi dan alihkan ke login
        document.cookie = "dr_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setAdminUser(null);
        setIsCheckingAuth(false);
        router.push("/admin/login");
        return;
      }

      // Sesi valid ditemukan
      const email = session.user.email || "admin@dapurrasa.com";
      const name =
        (session.user.user_metadata?.full_name as string) ||
        (session.user.user_metadata?.name as string) ||
        email.split("@")[0] ||
        "Admin Dapur Rasa";

      // Sinkronkan cookie untuk proteksi middleware server
      document.cookie = `dr_admin_session=${session.access_token}; path=/; max-age=604800; SameSite=Lax`;

      setAdminUser({
        id: session.user.id,
        email,
        name,
        role: "Administrator",
      });
      setIsCheckingAuth(false);
    });

    // 2. Langganan perubahan auth state (misal sign out dari tab lain)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session || !session.user) {
        document.cookie = "dr_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setAdminUser(null);
        router.push("/admin/login");
      } else if (session && session.user) {
        const email = session.user.email || "admin@dapurrasa.com";
        const name =
          (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          email.split("@")[0] ||
          "Admin Dapur Rasa";

        document.cookie = `dr_admin_session=${session.access_token}; path=/; max-age=604800; SameSite=Lax`;

        setAdminUser({
          id: session.user.id,
          email,
          name,
          role: "Administrator",
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Hapus cookie sesi
      document.cookie = "dr_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setAdminUser(null);
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
      document.cookie = "dr_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/admin/login");
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
          <span className="text-sm font-semibold text-slate-600">Memeriksa Sesi Admin Supabase...</span>
        </div>
      </div>
    );
  }

  // Jika tidak memiliki sesi admin yang sah, jangan render konten apapun
  if (!adminUser) {
    return null;
  }

  // 1. Menu Utama Toko Dapur Rasa
  const primaryMenuItems = [
    { label: "Katalog & Menu Supabase", href: "/admin", icon: Package, exact: true },
    { label: "Kelola Pesanan", href: "/admin/orders", icon: ShoppingBag },
    { label: "Galeri Foto", href: "/admin/gallery", icon: ImageIcon },
  ];

  // 2. Data Master (Kategori & Stok)
  const dataMasterItems = [
    { label: "Kategori Produk", href: "/admin/categories", icon: Layers },
    { label: "Manajemen Stok", href: "/admin/stock", icon: TrendingUp },
  ];

  // 3. Konten & Tampilan Web
  const kontenItems = [
    { label: "Artikel & Tips Kuliner", href: "/admin/content/articles", icon: BookOpen },
    { label: "Warna & Tema Website", href: "/admin/theme", icon: Palette },
    { label: "Tampilan Beranda", href: "/admin/homepage", icon: Layers },
    { label: "Tanya Jawab (FAQ)", href: "/admin/testimonials-faq", icon: HelpCircle },
  ];

  // 4. Pengaturan Toko
  const settingsMenuItem = {
    label: "Pengaturan & Keamanan",
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
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-white text-slate-700 flex-col shrink-0 border-r border-slate-200/90 shadow-2xs select-none">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <BrandLogoIcon />
          <div>
            <div className="text-[17px] leading-tight flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight">Dapur</span>
              <span className="font-extrabold text-[#EAB308] tracking-tight">Rasa</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto sidebar-scrollbar">
          {/* Menu Utama */}
          {primaryMenuItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? "bg-[#4A0E4E]/10 text-[#4A0E4E] font-bold shadow-2xs"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 stroke-[1.8] ${isActive ? "text-[#4A0E4E]" : "text-slate-700"}`} />
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

          {/* Pengaturan Toko */}
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

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#4A0E4E] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {adminUser?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {adminUser?.name || "Admin Dapur Rasa"}
              </div>
              <div className="text-[11px] text-slate-500 truncate" title={adminUser?.email}>
                {adminUser?.email}
              </div>
            </div>
          </div>

          {/* Outlined Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-slate-800 text-base hidden sm:inline">
                Pusat Kendali Dapur Rasa
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Supabase Connected</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/artikel"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Lihat Artikel</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#4A0E4E]/30 hover:border-[#4A0E4E] bg-purple-50/50 hover:bg-purple-50 text-[#4A0E4E] text-xs font-bold shadow-2xs transition-all"
            >
              <span>Lihat Toko Pelanggan</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#4A0E4E]" />
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
                      Admin Dashboard
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
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#4A0E4E]/10 text-[#4A0E4E] font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.8]" />
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
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#4A0E4E] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {adminUser?.name || "Admin Dapur Rasa"}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {adminUser?.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-white text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar Akun Admin</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

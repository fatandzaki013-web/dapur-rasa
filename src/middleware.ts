import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteksi ketat rute admin di tingkat server (Edge Server Protection)
  if (pathname.startsWith("/admin")) {
    // Kecualikan halaman login admin
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionCookie = req.cookies.get("dr_admin_session");

    // Jika tidak ada cookie sesi login yang sah, tolak akses dan redirect langsung di server
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

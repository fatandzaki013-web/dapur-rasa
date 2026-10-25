import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import WishlistDrawer from "@/components/WishlistDrawer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DynamicTheme from "@/components/DynamicTheme";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Dapur Rasa — Frozen Food & Kue Rumahan Berkualitas",
  description:
    "Toko online & retail frozen food dan aneka kue rumahan berkualitas. Menyajikan aneka pastel crispy, risol mayo lumer, sosis solo, brownies panggang, dan kebutuhan snack box higienis.",
  keywords: [
    "shofi frozen",
    "dapur rasa",
    "kue rumahan",
    "frozen food",
    "pastel crispy",
    "risol mayo",
    "snack box",
    "makanan beku",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme: any = null;
  try {
    theme = await prisma.themeConfig.findUnique({ where: { id: "default" } });
  } catch (e) {
    // fallback if db is starting
  }

  const primary = theme?.primaryColor || "#4B291B";
  const secondary = theme?.secondaryColor || "#A9683B";
  const bg = theme?.backgroundColor || "#FAF5EF";
  const surface = theme?.surfaceColor || "#FFFDF9";
  const accent = theme?.accentColor || "#EBD9C7";
  const text = theme?.textColor || "#211A16";

  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style
          id="ssr-theme-style"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${primary};
                --color-secondary: ${secondary};
                --color-bg: ${bg};
                --color-surface: ${surface};
                --color-accent: ${accent};
                --color-text: ${text};
              }
              html,
              body,
              main,
              #main-content,
              .bg-theme-bg,
              .bg-gray-50,
              .bg-gray-50\/40,
              .bg-gray-50\/50,
              .bg-slate-50,
              .bg-stone-50,
              .bg-white\/90 {
                background-color: ${bg} !important;
                color: ${text} !important;
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-theme-bg text-gray-900 transition-colors duration-300" style={{ backgroundColor: bg }}>
        <StoreProvider>
          <WishlistProvider>
            <CartProvider>
              <DynamicTheme />
              <Navbar />
              <div className="flex-1 flex flex-col bg-theme-bg" style={{ backgroundColor: bg }}>{children}</div>
              <Footer />
              <CartDrawer />
              <WishlistDrawer />
            </CartProvider>
          </WishlistProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

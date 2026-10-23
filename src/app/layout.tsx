import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900">
        <StoreProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

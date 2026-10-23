"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string; // unique combination of productId + variantId
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number; // calculated unit price including variant adjustment
  basePrice: number;
  promoPrice?: number | null;
  variantId?: string | null;
  variantName?: string | null;
  unit: string;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      promoPrice?: number | null;
      unit: string;
      stock: number;
      images?: Array<{ url: string }>;
    },
    variant?: { id: string; name: string; priceAdjustment: number; stock: number } | null,
    quantity?: number
  ) => { success: boolean; message: string };
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "dr_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load persistent cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal memuat keranjang dari localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save persistent cart to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Gagal menyimpan keranjang ke localStorage:", e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      promoPrice?: number | null;
      unit: string;
      stock: number;
      images?: Array<{ url: string }>;
    },
    variant?: { id: string; name: string; priceAdjustment: number; stock: number } | null,
    quantity = 1
  ): { success: boolean; message: string } => {
    const variantId = variant?.id || null;
    const variantName = variant?.name || null;
    const itemId = variantId ? `${product.id}_${variantId}` : product.id;

    // Check available stock
    const availableStock = variant ? Math.min(product.stock, variant.stock) : product.stock;
    if (availableStock <= 0) {
      return { success: false, message: `Maaf, stok produk "${product.name}" sedang habis.` };
    }

    const baseUnit = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;
    const finalPrice = baseUnit + (variant?.priceAdjustment || 0);

    const existingIndex = items.findIndex((i) => i.id === itemId);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > availableStock) {
        return {
          success: false,
          message: `Stok tidak mencukupi. Anda sudah memiliki ${currentQty} item di keranjang (maksimal stok ${availableStock}).`,
        };
      }

      setItems((prev) =>
        prev.map((it, idx) => (idx === existingIndex ? { ...it, quantity: newQty } : it))
      );
      return { success: true, message: `Jumlah "${product.name}" berhasil ditambahkan di keranjang.` };
    } else {
      if (quantity > availableStock) {
        return {
          success: false,
          message: `Jumlah melebihi stok yang tersedia (${availableStock} ${product.unit}).`,
        };
      }

      const imageUrl = product.images?.[0]?.url || "";

      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl,
        price: finalPrice,
        basePrice: product.price,
        promoPrice: product.promoPrice,
        variantId,
        variantName,
        unit: product.unit,
        quantity,
        maxStock: availableStock,
      };

      setItems((prev) => [...prev, newItem]);
      return { success: true, message: `"${product.name}" berhasil ditambahkan ke keranjang.` };
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

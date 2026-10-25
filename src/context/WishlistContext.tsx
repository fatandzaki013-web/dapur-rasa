"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ProductItem } from "@/lib/constants";

interface WishlistContextType {
  wishlist: ProductItem[];
  isLiked: (productId: string | number) => boolean;
  toggleWishlist: (product: ProductItem) => boolean; // returns true if added, false if removed
  removeFromWishlist: (productId: string | number) => void;
  clearWishlist: () => void;
  totalWishlist: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (isOpen: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "dapur_rasa_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (e) {
      console.error("Gagal membaca wishlist dari localStorage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Gagal menyimpan wishlist ke localStorage:", e);
    }
  }, [wishlist, isInitialized]);

  const isLiked = useCallback(
    (productId: string | number) => {
      const pId = String(productId);
      return wishlist.some((item) => String(item.id) === pId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product: ProductItem) => {
      const pId = String(product.id);
      let wasAdded = false;

      setWishlist((prev) => {
        const exists = prev.some((item) => String(item.id) === pId);
        if (exists) {
          wasAdded = false;
          return prev.filter((item) => String(item.id) !== pId);
        } else {
          wasAdded = true;
          return [...prev, product];
        }
      });

      return wasAdded;
    },
    []
  );

  const removeFromWishlist = useCallback((productId: string | number) => {
    const pId = String(productId);
    setWishlist((prev) => prev.filter((item) => String(item.id) !== pId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLiked,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalWishlist: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

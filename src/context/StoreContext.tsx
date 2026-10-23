"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface StoreSettings {
  id: string;
  brandName: string;
  tagline: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  whatsappNumber: string;
  address?: string | null;
  operationalHours: string;
  fulfillmentOptions: string;
  defaultShippingFee: number;
  minOrderAmount: number;
  currency: string;
  timezone: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ThemeConfig {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  accentColor: string;
  textColor: string;
  successColor: string;
  errorColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  borderRadius: string;
  buttonShape: string;
}

export interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonLink?: string | null;
  badgeText?: string | null;
  customConfig?: string | null;
  isEnabled: boolean;
  displayOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  showOnHome: boolean;
  _count?: { products: number };
}

interface StoreContextType {
  settings: StoreSettings | null;
  theme: ThemeConfig | null;
  sections: HomepageSection[];
  categories: Category[];
  isLoading: boolean;
  refreshStoreData: () => Promise<void>;
  formatPrice: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStoreData = useCallback(async () => {
    try {
      const res = await fetch("/api/public/bootstrap");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setTheme(data.theme);
        setSections(data.sections || []);
        setCategories(data.categories || []);

        // Inject dynamic theme CSS variables into :root
        if (data.theme) {
          const root = document.documentElement;
          root.style.setProperty("--color-primary", data.theme.primaryColor || "#4B291B");
          root.style.setProperty("--color-secondary", data.theme.secondaryColor || "#A9683B");
          root.style.setProperty("--color-bg", data.theme.backgroundColor || "#FAF5EF");
          root.style.setProperty("--color-surface", data.theme.surfaceColor || "#FFFDF9");
          root.style.setProperty("--color-accent", data.theme.accentColor || "#EBD9C7");
          root.style.setProperty("--color-text", data.theme.textColor || "#211A16");
          root.style.setProperty("--color-success", data.theme.successColor || "#287A49");
          root.style.setProperty("--color-error", data.theme.errorColor || "#B42318");
        }
      }
    } catch (e) {
      console.error("Gagal memuat data bootstrap toko:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();
  }, [refreshStoreData]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        theme,
        sections,
        categories,
        isLoading,
        refreshStoreData,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

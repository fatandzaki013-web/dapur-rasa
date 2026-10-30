import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rrlelcquomongshrwzkq.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_RFIqSWFxDgzORWfPd04ZuQ_Wy9Jz2nz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  unit: string;
  image_url: string;
  badge?: string | null;
  description?: string | null;
  is_available: boolean;
  created_at?: string;
  // Non-optional fields for UI compatibility
  stock: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
}

export interface OrderItemPayload {
  id?: string;
  name: string;
  variantName?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SupabaseOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string | null;
  items: OrderItemPayload[] | string;
  total_price: number;
  status: "pending" | "diproses" | "selesai" | string;
  created_at?: string;
}

export function parseOrderItems(items: any): OrderItemPayload[] {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeProduct(p: any): Product {
  const isAvailable = p.is_available ?? p.isAvailable ?? true;
  const imageUrl = p.image_url || p.images?.[0]?.url || "";
  const categoryName =
    typeof p.category === "object"
      ? p.category?.name || "Kue"
      : p.category || "Kue";

  return {
    ...p,
    category: categoryName,
    unit: p.unit || "pcs",
    image_url: imageUrl,
    is_available: isAvailable,
    isAvailable,
    stock: typeof p.stock === "number" ? p.stock : isAvailable ? 50 : 0,
    isBestSeller:
      p.badge?.toLowerCase().includes("favorit") || p.isBestSeller || false,
    images: [{ url: imageUrl, alt: p.name, isPrimary: true }],
  };
}

export async function fetchProductsFromSupabase(options?: {
  category?: string;
  search?: string;
  availableOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (options?.availableOnly) {
      query = query.eq("is_available", true);
    }

    if (
      options?.category &&
      options.category.toLowerCase() !== "semua" &&
      options.category.trim() !== ""
    ) {
      const cat = options.category.toLowerCase();
      if (cat === "nasi") {
        query = query.ilike("category", "%nasi%");
      } else if (cat === "kue" || cat === "aneka-kue-basah") {
        query = query.or(
          "category.ilike.%Pastel%,category.ilike.%Risol%,category.ilike.%Sosis Solo%,category.ilike.%Brownies%,category.ilike.%Kue%"
        );
      } else if (cat === "frozen" || cat === "frozen-food") {
        query = query.or(
          "category.ilike.%Frozen%,category.ilike.%Pastel%,category.ilike.%Risol%"
        );
      } else if (cat === "snack-box") {
        query = query.ilike("category", "%Snack Box%");
      } else {
        query = query.ilike("category", `%${options.category}%`);
      }
    }

    if (options?.search && options.search.trim() !== "") {
      const term = options.search.trim();
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.error("fetchProductsFromSupabase error:", err);
    return [];
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/ensure-seed";
import { fetchProductsFromSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const featured = searchParams.get("featured") === "true";
    const bestSeller = searchParams.get("bestSeller") === "true";
    const isNew = searchParams.get("isNew") === "true";
    const onHome = searchParams.get("onHome") === "true";
    const sort = searchParams.get("sort") || "order";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const availableParam = searchParams.get("available");

    const where: any = {};

    if (availableParam === "true") {
      where.isAvailable = true;
    } else if (availableParam === "false") {
      where.isAvailable = false;
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (categorySlug) {
      if (categorySlug === "kue") {
        where.OR = [
          { category: { slug: { in: ["aneka-kue-basah", "pastel", "risol", "sosis-solo", "brownies-bolu", "kue-kering"] } } },
          { name: { contains: "kue" } },
        ];
      } else if (categorySlug === "nasi") {
        where.OR = [
          { category: { slug: "nasi" } },
          { name: { contains: "nasi" } },
          { description: { contains: "nasi" } },
        ];
      } else if (categorySlug === "frozen" || categorySlug === "frozen-food") {
        where.category = { slug: "frozen-food" };
      } else if (categorySlug === "snack-box") {
        where.category = { slug: "snack-box" };
      } else {
        where.category = { slug: categorySlug };
      }
    }

    if (featured) where.isFeatured = true;
    if (bestSeller) where.isBestSeller = true;
    if (isNew) where.isNew = true;
    if (onHome) where.showOnHome = true;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = [{ displayOrder: "asc" }, { createdAt: "desc" }];
    if (sort === "price-asc") orderBy = [{ price: "asc" }];
    else if (sort === "price-desc") orderBy = [{ price: "desc" }];
    else if (sort === "newest") orderBy = [{ createdAt: "desc" }];
    else if (sort === "name-asc") orderBy = [{ name: "asc" }];

    let products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: {
          where: { isAvailable: true },
        },
      },
    });

    // Jika produk kosong dan tidak sedang filter pencarian, pastikan data awal diimpor
    if (products.length === 0) {
      const supa = await fetchProductsFromSupabase({
        category: categorySlug,
        search,
        availableOnly: availableParam === "true",
      });
      if (supa.length > 0) {
        return NextResponse.json(
          { products: supa, total: supa.length },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
    }

    if (products.length === 0 && !search.trim()) {
      await ensureInitialData();
      products = await prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { displayOrder: "asc" },
          },
          variants: {
            where: { isAvailable: true },
          },
        },
      });
    }

    return NextResponse.json(
      {
        products,
        total: products.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Gagal memuat produk." }, { status: 500 });
  }
}

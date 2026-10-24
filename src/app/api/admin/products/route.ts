import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
      },
    });

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Gagal memuat produk: " + (error?.message || "Kesalahan database.") }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      price,
      promoPrice,
      sku,
      unit,
      stock,
      minStockAlert,
      isAvailable,
      isBestSeller,
      isFeatured,
      isNew,
      showOnHome,
      displayOrder,
      categoryId,
      ingredients,
      allergens,
      storageGuide,
      shelfLife,
      weightGrams,
      piecesPerPack,
      seoTitle,
      seoDesc,
      images,
      variants,
    } = body;

    if (!name || !description || price === undefined || !categoryId) {
      return NextResponse.json({ error: "Nama, deskripsi, harga, dan kategori wajib diisi." }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({ error: "Harga tidak boleh bernilai negatif." }, { status: 400 });
    }

    if (promoPrice && promoPrice >= price) {
      return NextResponse.json({ error: "Harga promo harus lebih kecil dari harga normal." }, { status: 400 });
    }

    // Generate slug if empty
    const productSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug produk sudah digunakan, silakan gunakan slug lain." }, { status: 400 });
    }

    const initialStock = stock !== undefined ? Math.max(0, Number(stock)) : 10;

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: productSlug,
        shortDescription: shortDescription?.trim() || null,
        description: description.trim(),
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : null,
        sku: sku?.trim() || null,
        unit: unit?.trim() || "pcs",
        stock: initialStock,
        minStockAlert: minStockAlert ? Number(minStockAlert) : 5,
        isAvailable: isAvailable ?? true,
        isBestSeller: Boolean(isBestSeller),
        isFeatured: Boolean(isFeatured),
        isNew: Boolean(isNew),
        showOnHome: showOnHome ?? true,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        categoryId,
        ingredients: ingredients?.trim() || null,
        allergens: allergens?.trim() || null,
        storageGuide: storageGuide?.trim() || null,
        shelfLife: shelfLife?.trim() || null,
        weightGrams: weightGrams ? Number(weightGrams) : null,
        piecesPerPack: piecesPerPack ? Number(piecesPerPack) : 1,
        seoTitle: seoTitle?.trim() || null,
        seoDesc: seoDesc?.trim() || null,
        images: {
          create: Array.isArray(images)
            ? images.map((img: any, idx: number) => ({
                url: img.url,
                alt: img.alt || name,
                isPrimary: idx === 0,
                displayOrder: idx,
              }))
            : [],
        },
        variants: {
          create: Array.isArray(variants)
            ? variants.map((v: any) => ({
                name: v.name,
                priceAdjustment: Number(v.priceAdjustment) || 0,
                stock: v.stock !== undefined ? Number(v.stock) : 10,
                isAvailable: true,
              }))
            : [],
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    // Record initial stock log
    try {
      await prisma.stockLog.create({
        data: {
          productId: newProduct.id,
          changeAmount: initialStock,
          previousStock: 0,
          newStock: initialStock,
          reason: "Stok awal produk baru",
        },
      });
    } catch (logErr) {
      console.warn("Stock log error:", logErr);
    }

    // Segera bersihkan cache halaman publik agar produk baru langsung tampil saat online
    try {
      revalidatePath("/");
      revalidatePath("/produk");
      revalidatePath(`/produk/${newProduct.slug}`);
      revalidatePath("/admin/products");
    } catch (e) {}

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Admin products POST error:", error);
    const msg = error?.message || "";
    const isReadOnly = msg.includes("readonly") || msg.includes("EROFS") || msg.includes("unable to open database file");
    const errorText = isReadOnly
      ? "Database bersifat Read-Only di hosting online ini (Vercel serverless). Untuk menyimpan produk baru secara permanen di cloud, hubungkan database PostgreSQL (seperti Supabase / Neon) pada DATABASE_URL di dashboard hosting."
      : (msg || "Gagal membuat produk.");

    return NextResponse.json({ error: errorText }, { status: 500 });
  }
}

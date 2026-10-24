import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Export all products as backup JSON
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        total: products.length,
        products,
      },
      {
        headers: {
          "Content-Disposition": `attachment; filename="dapur-rasa-products-backup-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengekspor data: " + error?.message }, { status: 500 });
  }
}

// Import products from backup JSON
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const importedProducts = Array.isArray(body) ? body : body.products;

    if (!Array.isArray(importedProducts) || importedProducts.length === 0) {
      return NextResponse.json({ error: "Format file JSON tidak valid atau data produk kosong." }, { status: 400 });
    }

    let importedCount = 0;

    for (const p of importedProducts) {
      if (!p.name || p.price === undefined) continue;

      // Ensure category exists
      let categoryId = p.categoryId;
      if (!categoryId && p.category?.name) {
        const catSlug = p.category.slug || p.category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const cat = await prisma.category.upsert({
          where: { slug: catSlug },
          update: { name: p.category.name },
          create: { name: p.category.name, slug: catSlug },
        });
        categoryId = cat.id;
      }

      if (!categoryId) {
        const firstCat = await prisma.category.findFirst();
        if (firstCat) categoryId = firstCat.id;
      }

      const productSlug =
        p.slug?.trim() ||
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

      const dataPayload: any = {
        name: p.name.trim(),
        slug: productSlug,
        shortDescription: p.shortDescription || null,
        description: p.description || p.name,
        price: Number(p.price) || 0,
        promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        sku: p.sku || null,
        unit: p.unit || "pcs",
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        minStockAlert: p.minStockAlert ? Number(p.minStockAlert) : 5,
        isAvailable: p.isAvailable ?? true,
        isBestSeller: Boolean(p.isBestSeller),
        isFeatured: Boolean(p.isFeatured),
        isNew: Boolean(p.isNew),
        showOnHome: p.showOnHome ?? true,
        displayOrder: p.displayOrder ? Number(p.displayOrder) : 0,
        categoryId: categoryId || "",
        ingredients: p.ingredients || null,
        allergens: p.allergens || null,
        storageGuide: p.storageGuide || null,
        shelfLife: p.shelfLife || null,
        weightGrams: p.weightGrams ? Number(p.weightGrams) : null,
        piecesPerPack: p.piecesPerPack ? Number(p.piecesPerPack) : 1,
      };

      const upserted = await prisma.product.upsert({
        where: { slug: productSlug },
        update: dataPayload,
        create: dataPayload,
      });

      // Update images
      if (Array.isArray(p.images) && p.images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: upserted.id } });
        for (let i = 0; i < p.images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: upserted.id,
              url: p.images[i].url,
              alt: p.images[i].alt || upserted.name,
              isPrimary: i === 0,
              displayOrder: i,
            },
          });
        }
      }

      // Update variants
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        await prisma.productVariant.deleteMany({ where: { productId: upserted.id } });
        for (const v of p.variants) {
          if (v.name) {
            await prisma.productVariant.create({
              data: {
                productId: upserted.id,
                name: v.name,
                priceAdjustment: Number(v.priceAdjustment) || 0,
                stock: v.stock !== undefined ? Number(v.stock) : 10,
                isAvailable: v.isAvailable ?? true,
              },
            });
          }
        }
      }

      importedCount++;
    }

    try {
      revalidatePath("/");
      revalidatePath("/produk");
      revalidatePath("/admin/products");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${importedCount} produk ke database.`,
      importedCount,
    });
  } catch (error: any) {
    console.error("Backup import error:", error);
    return NextResponse.json({ error: "Gagal mengimpor produk: " + error?.message }, { status: 500 });
  }
}

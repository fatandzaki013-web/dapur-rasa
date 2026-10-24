import { prisma } from "@/lib/prisma";
import initialData from "../../prisma/initial-data.json";

let isSeeding = false;

export async function ensureInitialData() {
  if (isSeeding) return;
  try {
    const count = await prisma.product.count();
    if (count > 0) return;

    isSeeding = true;
    console.log("[AUTO-SEED] Database kosong. Mengimpor seluruh produk dan gambar awal...");

    // 1. Categories
    const categoryMap = new Map<string, string>();
    for (const c of (initialData as any).Category || []) {
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          displayOrder: Number(c.displayOrder) || 0,
          isActive: Boolean(c.isActive),
          showOnHome: Boolean(c.showOnHome),
        },
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          displayOrder: Number(c.displayOrder) || 0,
          isActive: Boolean(c.isActive),
          showOnHome: Boolean(c.showOnHome),
        },
      });
      categoryMap.set(c.id, created.id);
    }

    // 2. Products
    for (const p of (initialData as any).Product || []) {
      const catId = categoryMap.get(p.categoryId) || p.categoryId;
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          shortDescription: p.shortDescription,
          description: p.description,
          price: Number(p.price),
          promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
          sku: p.sku,
          unit: p.unit || "pcs",
          stock: Number(p.stock) || 0,
          minStockAlert: Number(p.minStockAlert) || 5,
          isAvailable: Boolean(p.isAvailable),
          isBestSeller: Boolean(p.isBestSeller),
          isFeatured: Boolean(p.isFeatured),
          isNew: Boolean(p.isNew),
          showOnHome: Boolean(p.showOnHome),
          displayOrder: Number(p.displayOrder) || 0,
          categoryId: catId,
          seoTitle: p.seoTitle,
          seoDesc: p.seoDesc,
          ingredients: p.ingredients,
          allergens: p.allergens,
          storageGuide: p.storageGuide,
          shelfLife: p.shelfLife,
          weightGrams: p.weightGrams ? Number(p.weightGrams) : null,
          piecesPerPack: p.piecesPerPack ? Number(p.piecesPerPack) : null,
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          description: p.description,
          price: Number(p.price),
          promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
          sku: p.sku,
          unit: p.unit || "pcs",
          stock: Number(p.stock) || 0,
          minStockAlert: Number(p.minStockAlert) || 5,
          isAvailable: Boolean(p.isAvailable),
          isBestSeller: Boolean(p.isBestSeller),
          isFeatured: Boolean(p.isFeatured),
          isNew: Boolean(p.isNew),
          showOnHome: Boolean(p.showOnHome),
          displayOrder: Number(p.displayOrder) || 0,
          categoryId: catId,
          seoTitle: p.seoTitle,
          seoDesc: p.seoDesc,
          ingredients: p.ingredients,
          allergens: p.allergens,
          storageGuide: p.storageGuide,
          shelfLife: p.shelfLife,
          weightGrams: p.weightGrams ? Number(p.weightGrams) : null,
          piecesPerPack: p.piecesPerPack ? Number(p.piecesPerPack) : null,
        },
      });
    }

    // 3. Product Images
    for (const img of (initialData as any).ProductImage || []) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {
          url: img.url,
          alt: img.alt,
          isPrimary: Boolean(img.isPrimary),
          displayOrder: Number(img.displayOrder) || 0,
        },
        create: {
          id: img.id,
          productId: img.productId,
          url: img.url,
          alt: img.alt,
          isPrimary: Boolean(img.isPrimary),
          displayOrder: Number(img.displayOrder) || 0,
        },
      });
    }

    // 4. Product Variants
    for (const v of (initialData as any).ProductVariant || []) {
      await prisma.productVariant.upsert({
        where: { id: v.id },
        update: {
          name: v.name,
          priceAdjustment: Number(v.priceAdjustment) || 0,
          stock: Number(v.stock) || 0,
          isAvailable: Boolean(v.isAvailable),
        },
        create: {
          id: v.id,
          productId: v.productId,
          name: v.name,
          priceAdjustment: Number(v.priceAdjustment) || 0,
          stock: Number(v.stock) || 0,
          isAvailable: Boolean(v.isAvailable),
        },
      });
    }

    // 5. StoreSetting
    for (const s of (initialData as any).StoreSetting || []) {
      const { id, createdAt, updatedAt, ...rest } = s;
      await prisma.storeSetting.upsert({
        where: { id: id || "default" },
        update: rest,
        create: { id: id || "default", ...rest },
      });
    }

    // 6. Homepage Sections
    for (const hs of (initialData as any).HomepageSection || []) {
      await prisma.homepageSection.upsert({
        where: { sectionKey: hs.sectionKey },
        update: {
          title: hs.title,
          subtitle: hs.subtitle,
          description: hs.description,
          imageUrl: hs.imageUrl,
          mobileImageUrl: hs.mobileImageUrl,
          buttonText: hs.buttonText,
          buttonLink: hs.buttonLink,
          secondaryButtonText: hs.secondaryButtonText,
          secondaryButtonLink: hs.secondaryButtonLink,
          badgeText: hs.badgeText,
          isEnabled: Boolean(hs.isEnabled),
          displayOrder: Number(hs.displayOrder) || 0,
          customConfig: hs.customConfig,
        },
        create: {
          id: hs.id,
          sectionKey: hs.sectionKey,
          title: hs.title,
          subtitle: hs.subtitle,
          description: hs.description,
          imageUrl: hs.imageUrl,
          mobileImageUrl: hs.mobileImageUrl,
          buttonText: hs.buttonText,
          buttonLink: hs.buttonLink,
          secondaryButtonText: hs.secondaryButtonText,
          secondaryButtonLink: hs.secondaryButtonLink,
          badgeText: hs.badgeText,
          isEnabled: Boolean(hs.isEnabled),
          displayOrder: Number(hs.displayOrder) || 0,
          customConfig: hs.customConfig,
        },
      });
    }

    // 7. Gallery
    for (const g of (initialData as any).GalleryItem || []) {
      await prisma.galleryItem.upsert({
        where: { id: g.id },
        update: {
          title: g.title,
          imageUrl: g.imageUrl,
          caption: g.caption,
          categoryTag: g.categoryTag,
          altText: g.altText,
          productId: g.productId || null,
          isPublished: Boolean(g.isPublished),
          displayOrder: Number(g.displayOrder) || 0,
        },
        create: {
          id: g.id,
          title: g.title,
          imageUrl: g.imageUrl,
          caption: g.caption,
          categoryTag: g.categoryTag,
          altText: g.altText,
          productId: g.productId || null,
          isPublished: Boolean(g.isPublished),
          displayOrder: Number(g.displayOrder) || 0,
        },
      });
    }

    console.log("[AUTO-SEED] Berhasil memulihkan seluruh produk dan data awal!");
  } catch (err: any) {
    console.warn("[AUTO-SEED WARNING] Tidak dapat menjalankan auto-seed:", err?.message);
  } finally {
    isSeeding = false;
  }
}

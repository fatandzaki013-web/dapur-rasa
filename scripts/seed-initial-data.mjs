import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

function toBool(val) {
  if (val === true || val === 1 || val === "1" || val === "true") return true;
  if (val === false || val === 0 || val === "0" || val === "false") return false;
  return Boolean(val);
}

function toDate(val) {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function seedAllData() {
  const jsonPath = path.join(rootDir, "prisma", "initial-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn("[SEED] initial-data.json tidak ditemukan, lewati import otomatis.");
    return;
  }

  console.log("🚀 [SEED] Membaca data awal lengkap dari initial-data.json...");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  // 1. User
  if (data.User?.length) {
    for (const u of data.User) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {
          name: u.name,
          role: u.role || "ADMIN",
          passwordHash: u.passwordHash,
        },
        create: {
          id: u.id,
          username: u.username,
          name: u.name,
          role: u.role || "ADMIN",
          passwordHash: u.passwordHash,
          createdAt: toDate(u.createdAt) || new Date(),
          updatedAt: toDate(u.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.User.length} User siap.`);
  }

  // 2. StoreSetting
  if (data.StoreSetting?.length) {
    for (const s of data.StoreSetting) {
      const { id, createdAt, updatedAt, ...rest } = s;
      await prisma.storeSetting.upsert({
        where: { id: id || "default" },
        update: rest,
        create: {
          id: id || "default",
          ...rest,
        },
      });
    }
    console.log("✅ [SEED] StoreSetting siap.");
  }

  // 3. ThemeConfig
  if (data.ThemeConfig?.length) {
    for (const tc of data.ThemeConfig) {
      const { id, updatedAt, ...rest } = tc;
      await prisma.themeConfig.upsert({
        where: { id: id || "default" },
        update: rest,
        create: {
          id: id || "default",
          ...rest,
        },
      });
    }
    console.log("✅ [SEED] ThemeConfig siap.");
  }

  // 4. Category
  if (data.Category?.length) {
    for (const c of data.Category) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          displayOrder: Number(c.displayOrder) || 0,
          isActive: toBool(c.isActive),
          showOnHome: toBool(c.showOnHome),
        },
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          displayOrder: Number(c.displayOrder) || 0,
          isActive: toBool(c.isActive),
          showOnHome: toBool(c.showOnHome),
          createdAt: toDate(c.createdAt) || new Date(),
          updatedAt: toDate(c.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.Category.length} Kategori siap.`);
  }

  // 5. Product
  if (data.Product?.length) {
    for (const p of data.Product) {
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
          isAvailable: toBool(p.isAvailable),
          isBestSeller: toBool(p.isBestSeller),
          isFeatured: toBool(p.isFeatured),
          isNew: toBool(p.isNew),
          showOnHome: toBool(p.showOnHome),
          displayOrder: Number(p.displayOrder) || 0,
          categoryId: p.categoryId,
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
          isAvailable: toBool(p.isAvailable),
          isBestSeller: toBool(p.isBestSeller),
          isFeatured: toBool(p.isFeatured),
          isNew: toBool(p.isNew),
          showOnHome: toBool(p.showOnHome),
          displayOrder: Number(p.displayOrder) || 0,
          categoryId: p.categoryId,
          seoTitle: p.seoTitle,
          seoDesc: p.seoDesc,
          ingredients: p.ingredients,
          allergens: p.allergens,
          storageGuide: p.storageGuide,
          shelfLife: p.shelfLife,
          weightGrams: p.weightGrams ? Number(p.weightGrams) : null,
          piecesPerPack: p.piecesPerPack ? Number(p.piecesPerPack) : null,
          createdAt: toDate(p.createdAt) || new Date(),
          updatedAt: toDate(p.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.Product.length} Produk lengkap berhasil disinkronisasi.`);
  }

  // 6. ProductImage
  if (data.ProductImage?.length) {
    for (const img of data.ProductImage) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {
          url: img.url,
          alt: img.alt,
          isPrimary: toBool(img.isPrimary),
          displayOrder: Number(img.displayOrder) || 0,
        },
        create: {
          id: img.id,
          productId: img.productId,
          url: img.url,
          alt: img.alt,
          isPrimary: toBool(img.isPrimary),
          displayOrder: Number(img.displayOrder) || 0,
          createdAt: toDate(img.createdAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.ProductImage.length} Gambar produk siap.`);
  }

  // 7. ProductVariant
  if (data.ProductVariant?.length) {
    for (const v of data.ProductVariant) {
      await prisma.productVariant.upsert({
        where: { id: v.id },
        update: {
          name: v.name,
          priceAdjustment: Number(v.priceAdjustment) || 0,
          stock: Number(v.stock) || 0,
          isAvailable: toBool(v.isAvailable),
        },
        create: {
          id: v.id,
          productId: v.productId,
          name: v.name,
          priceAdjustment: Number(v.priceAdjustment) || 0,
          stock: Number(v.stock) || 0,
          isAvailable: toBool(v.isAvailable),
          createdAt: toDate(v.createdAt) || new Date(),
          updatedAt: toDate(v.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.ProductVariant.length} Varian produk siap.`);
  }

  // 8. GalleryItem
  if (data.GalleryItem?.length) {
    for (const g of data.GalleryItem) {
      await prisma.galleryItem.upsert({
        where: { id: g.id },
        update: {
          title: g.title,
          imageUrl: g.imageUrl,
          caption: g.caption,
          categoryTag: g.categoryTag,
          altText: g.altText,
          productId: g.productId || null,
          isPublished: toBool(g.isPublished),
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
          isPublished: toBool(g.isPublished),
          displayOrder: Number(g.displayOrder) || 0,
          createdAt: toDate(g.createdAt) || new Date(),
          updatedAt: toDate(g.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.GalleryItem.length} Galeri foto siap.`);
  }

  // 9. HomepageSection
  if (data.HomepageSection?.length) {
    for (const hs of data.HomepageSection) {
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
          isEnabled: toBool(hs.isEnabled),
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
          isEnabled: toBool(hs.isEnabled),
          displayOrder: Number(hs.displayOrder) || 0,
          customConfig: hs.customConfig,
          updatedAt: toDate(hs.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.HomepageSection.length} Bagian beranda siap.`);
  }

  // 10. Testimonial
  if (data.Testimonial?.length) {
    for (const t of data.Testimonial) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          customerName: t.customerName,
          comment: t.comment,
          rating: Number(t.rating) || 5,
          avatarUrl: t.avatarUrl,
          eventOrProduct: t.eventOrProduct,
          isApproved: toBool(t.isApproved),
          displayOrder: Number(t.displayOrder) || 0,
          isSample: toBool(t.isSample),
        },
        create: {
          id: t.id,
          customerName: t.customerName,
          comment: t.comment,
          rating: Number(t.rating) || 5,
          avatarUrl: t.avatarUrl,
          eventOrProduct: t.eventOrProduct,
          isApproved: toBool(t.isApproved),
          displayOrder: Number(t.displayOrder) || 0,
          isSample: toBool(t.isSample),
          createdAt: toDate(t.createdAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.Testimonial.length} Testimoni siap.`);
  }

  // 11. FaqItem
  if (data.FaqItem?.length) {
    for (const f of data.FaqItem) {
      await prisma.faqItem.upsert({
        where: { id: f.id },
        update: {
          question: f.question,
          answer: f.answer,
          category: f.category || "Umum",
          displayOrder: Number(f.displayOrder) || 0,
          isActive: toBool(f.isActive),
        },
        create: {
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category || "Umum",
          displayOrder: Number(f.displayOrder) || 0,
          isActive: toBool(f.isActive),
          createdAt: toDate(f.createdAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.FaqItem.length} FAQ siap.`);
  }

  // 12. Article
  if (data.Article?.length) {
    for (const a of data.Article) {
      await prisma.article.upsert({
        where: { slug: a.slug },
        update: {
          title: a.title,
          excerpt: a.excerpt,
          content: a.content,
          coverImage: a.coverImage,
          category: a.category,
          tags: a.tags,
          status: a.status || "PUBLISHED",
          authorName: a.authorName,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
        },
        create: {
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          coverImage: a.coverImage,
          category: a.category,
          tags: a.tags,
          status: a.status || "PUBLISHED",
          authorName: a.authorName,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          publishedAt: toDate(a.publishedAt) || new Date(),
          createdAt: toDate(a.createdAt) || new Date(),
          updatedAt: toDate(a.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ [SEED] ${data.Article.length} Artikel siap.`);
  }

  console.log("🎉 [SEED] Seluruh produk, gambar, kategori, dan konten berhasil dimasukkan!");
}

async function run() {
  try {
    await seedAllData();
  } catch (err) {
    console.error("[SEED ERROR] Gagal melakukan seeding:", err);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}

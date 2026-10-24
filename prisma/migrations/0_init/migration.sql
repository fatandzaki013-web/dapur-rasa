-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "promoPrice" DOUBLE PRECISION,
    "sku" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "stock" INTEGER NOT NULL DEFAULT 10,
    "minStockAlert" INTEGER NOT NULL DEFAULT 5,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDesc" TEXT,
    "ingredients" TEXT,
    "allergens" TEXT,
    "storageGuide" TEXT,
    "shelfLife" TEXT,
    "weightGrams" INTEGER,
    "piecesPerPack" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "categoryTag" TEXT,
    "altText" TEXT,
    "productId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "fulfillmentType" TEXT NOT NULL DEFAULT 'PICKUP',
    "deliveryAddress" TEXT,
    "scheduleDate" TEXT,
    "scheduleTime" TEXT,
    "notes" TEXT,
    "paymentMethod" TEXT DEFAULT 'QRIS_GOPAY',
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU_KONFIRMASI',
    "paymentStatus" TEXT NOT NULL DEFAULT 'BELUM_DIVERIFIKASI',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "changeAmount" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandName" TEXT NOT NULL DEFAULT 'Dapur Rasa',
    "tagline" TEXT NOT NULL DEFAULT 'Kue & Camilan Rumahan Kualitas Premium',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "whatsappNumber" TEXT NOT NULL DEFAULT '6281234567890',
    "address" TEXT DEFAULT 'Jl. Mawar Melati No. 12, Jakarta',
    "operationalHours" TEXT NOT NULL DEFAULT 'Senin - Sabtu: 08:00 - 18:00 WIB',
    "fulfillmentOptions" TEXT NOT NULL DEFAULT 'PICKUP,DELIVERY',
    "defaultShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 15000,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "metaTitle" TEXT DEFAULT 'Dapur Rasa | Aneka Kue & Camilan Rumahan Lezat',
    "metaDescription" TEXT DEFAULT 'Pesan aneka kue basah, pastel, risol, bolu, dan snack box lezat khas rumahan dengan bahan premium.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primaryColor" TEXT NOT NULL DEFAULT '#4B291B',
    "secondaryColor" TEXT NOT NULL DEFAULT '#A9683B',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FAF5EF',
    "surfaceColor" TEXT NOT NULL DEFAULT '#FFFDF9',
    "accentColor" TEXT NOT NULL DEFAULT '#EBD9C7',
    "textColor" TEXT NOT NULL DEFAULT '#211A16',
    "successColor" TEXT NOT NULL DEFAULT '#287A49',
    "errorColor" TEXT NOT NULL DEFAULT '#B42318',
    "fontFamilyHeading" TEXT NOT NULL DEFAULT 'serif',
    "fontFamilyBody" TEXT NOT NULL DEFAULT 'sans',
    "borderRadius" TEXT NOT NULL DEFAULT 'rounded-xl',
    "buttonShape" TEXT NOT NULL DEFAULT 'rounded-lg',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "secondaryButtonText" TEXT,
    "secondaryButtonLink" TEXT,
    "badgeText" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "customConfig" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatarUrl" TEXT,
    "eventOrProduct" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isSample" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Umum',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "buttonText" TEXT,
    "badgeText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Kuliner & Resep',
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "authorName" TEXT DEFAULT 'Super Admin',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_sectionKey_key" ON "HomepageSection"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLog" ADD CONSTRAINT "StockLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


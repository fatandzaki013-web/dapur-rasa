import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
      },
    });

    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat produk." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

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

    // Check slug uniqueness if changed
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists && slugExists.id !== id) {
        return NextResponse.json({ error: "Slug sudah digunakan oleh produk lain." }, { status: 400 });
      }
    }

    const newStock = stock !== undefined ? Math.max(0, Number(stock)) : existingProduct.stock;
    const stockDiff = newStock - existingProduct.stock;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingProduct.name,
        slug: slug !== undefined ? slug.trim() : existingProduct.slug,
        shortDescription: shortDescription !== undefined ? shortDescription?.trim() : existingProduct.shortDescription,
        description: description !== undefined ? description.trim() : existingProduct.description,
        price: price !== undefined ? Number(price) : existingProduct.price,
        promoPrice: promoPrice !== undefined ? (promoPrice ? Number(promoPrice) : null) : existingProduct.promoPrice,
        sku: sku !== undefined ? sku?.trim() : existingProduct.sku,
        unit: unit !== undefined ? unit.trim() : existingProduct.unit,
        stock: newStock,
        minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : existingProduct.minStockAlert,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existingProduct.isAvailable,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : existingProduct.isBestSeller,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existingProduct.isFeatured,
        isNew: isNew !== undefined ? Boolean(isNew) : existingProduct.isNew,
        showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : existingProduct.showOnHome,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : existingProduct.displayOrder,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
        ingredients: ingredients !== undefined ? ingredients?.trim() : existingProduct.ingredients,
        allergens: allergens !== undefined ? allergens?.trim() : existingProduct.allergens,
        storageGuide: storageGuide !== undefined ? storageGuide?.trim() : existingProduct.storageGuide,
        shelfLife: shelfLife !== undefined ? shelfLife?.trim() : existingProduct.shelfLife,
        weightGrams: weightGrams !== undefined ? (weightGrams ? Number(weightGrams) : null) : existingProduct.weightGrams,
        piecesPerPack: piecesPerPack !== undefined ? (piecesPerPack ? Number(piecesPerPack) : 1) : existingProduct.piecesPerPack,
        seoTitle: seoTitle !== undefined ? seoTitle?.trim() : existingProduct.seoTitle,
        seoDesc: seoDesc !== undefined ? seoDesc?.trim() : existingProduct.seoDesc,
      },
    });

    // Stock change log
    if (stockDiff !== 0) {
      await prisma.stockLog.create({
        data: {
          productId: id,
          changeAmount: stockDiff,
          previousStock: existingProduct.stock,
          newStock,
          reason: body.stockReason || "Penyesuaian manual admin dari form produk",
        },
      });
    }

    // Update images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: images[i].url,
            alt: images[i].alt || updated.name,
            isPrimary: i === 0,
            displayOrder: i,
          },
        });
      }
    }

    // Update variants if provided
    if (Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      for (const v of variants) {
        if (v.name?.trim()) {
          await prisma.productVariant.create({
            data: {
              productId: id,
              name: v.name.trim(),
              priceAdjustment: Number(v.priceAdjustment) || 0,
              stock: v.stock !== undefined ? Number(v.stock) : 10,
              isAvailable: v.isAvailable ?? true,
            },
          });
        }
      }
    }

    const result = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product: result });
  } catch (error) {
    console.error("Admin products PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui produk." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Check if product is part of order items to preserve historical records safely
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      // Instead of hard deleting and breaking historical orders, archive the product
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false, showOnHome: false },
      });
      return NextResponse.json({
        success: true,
        message: "Produk memiliki riwayat pesanan sehingga diarsipkan (dinonaktifkan) untuk menjaga integritas data pesanan.",
        archived: true,
      });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Admin products DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk." }, { status: 500 });
  }
}

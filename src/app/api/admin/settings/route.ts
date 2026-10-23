import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat pengaturan toko." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      brandName,
      tagline,
      logoUrl,
      faviconUrl,
      whatsappNumber,
      address,
      operationalHours,
      fulfillmentOptions,
      defaultShippingFee,
      minOrderAmount,
      currency,
      timezone,
      instagramUrl,
      facebookUrl,
      tiktokUrl,
      metaTitle,
      metaDescription,
    } = body;

    const settings = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {
        brandName: brandName !== undefined ? brandName.trim() : undefined,
        tagline: tagline !== undefined ? tagline.trim() : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl.trim() : undefined,
        faviconUrl: faviconUrl !== undefined ? faviconUrl.trim() : undefined,
        whatsappNumber: whatsappNumber !== undefined ? whatsappNumber.trim() : undefined,
        address: address !== undefined ? address.trim() : undefined,
        operationalHours: operationalHours !== undefined ? operationalHours.trim() : undefined,
        fulfillmentOptions: fulfillmentOptions !== undefined ? fulfillmentOptions : undefined,
        defaultShippingFee: defaultShippingFee !== undefined ? Number(defaultShippingFee) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : undefined,
        currency: currency !== undefined ? currency.trim() : undefined,
        timezone: timezone !== undefined ? timezone.trim() : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl.trim() : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl.trim() : undefined,
        tiktokUrl: tiktokUrl !== undefined ? tiktokUrl.trim() : undefined,
        metaTitle: metaTitle !== undefined ? metaTitle.trim() : undefined,
        metaDescription: metaDescription !== undefined ? metaDescription.trim() : undefined,
      },
      create: {
        id: "default",
        brandName: brandName || "Dapur Rasa",
        tagline: tagline || "Kue & Camilan Rumahan Kualitas Premium",
        logoUrl: logoUrl || "",
        faviconUrl: faviconUrl || "",
        whatsappNumber: whatsappNumber || "6281234567890",
        address: address || "",
        operationalHours: operationalHours || "Senin - Sabtu: 08:00 - 18:00 WIB",
        fulfillmentOptions: fulfillmentOptions || "PICKUP,DELIVERY",
        defaultShippingFee: defaultShippingFee !== undefined ? Number(defaultShippingFee) : 15000,
        minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 0,
        currency: currency || "IDR",
        timezone: timezone || "Asia/Jakarta",
        instagramUrl: instagramUrl || "",
        facebookUrl: facebookUrl || "",
        tiktokUrl: tiktokUrl || "",
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan toko." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sections = await prisma.homepageSection.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat sections." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Format data sections harus berupa array." }, { status: 400 });
    }

    const updatedSections = [];
    for (const sec of sections) {
      if (!sec.id && !sec.sectionKey) continue;

      const updated = await prisma.homepageSection.upsert({
        where: sec.id ? { id: sec.id } : { sectionKey: sec.sectionKey },
        update: {
          title: sec.title !== undefined ? sec.title : undefined,
          subtitle: sec.subtitle !== undefined ? sec.subtitle : undefined,
          description: sec.description !== undefined ? sec.description : undefined,
          imageUrl: sec.imageUrl !== undefined ? sec.imageUrl : undefined,
          mobileImageUrl: sec.mobileImageUrl !== undefined ? sec.mobileImageUrl : undefined,
          buttonText: sec.buttonText !== undefined ? sec.buttonText : undefined,
          buttonLink: sec.buttonLink !== undefined ? sec.buttonLink : undefined,
          secondaryButtonText: sec.secondaryButtonText !== undefined ? sec.secondaryButtonText : undefined,
          secondaryButtonLink: sec.secondaryButtonLink !== undefined ? sec.secondaryButtonLink : undefined,
          badgeText: sec.badgeText !== undefined ? sec.badgeText : undefined,
          customConfig: sec.customConfig !== undefined ? sec.customConfig : undefined,
          isEnabled: sec.isEnabled !== undefined ? Boolean(sec.isEnabled) : undefined,
          displayOrder: sec.displayOrder !== undefined ? Number(sec.displayOrder) : undefined,
        },
        create: {
          sectionKey: sec.sectionKey,
          title: sec.title || "",
          subtitle: sec.subtitle || "",
          description: sec.description || "",
          imageUrl: sec.imageUrl || null,
          mobileImageUrl: sec.mobileImageUrl || null,
          buttonText: sec.buttonText || null,
          buttonLink: sec.buttonLink || null,
          secondaryButtonText: sec.secondaryButtonText || null,
          secondaryButtonLink: sec.secondaryButtonLink || null,
          badgeText: sec.badgeText || null,
          customConfig: sec.customConfig || null,
          isEnabled: sec.isEnabled ?? true,
          displayOrder: sec.displayOrder ? Number(sec.displayOrder) : 0,
        },
      });
      updatedSections.push(updated);
    }

    return NextResponse.json({ success: true, sections: updatedSections });
  } catch (error) {
    console.error("Sections PUT error:", error);
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi sections." }, { status: 500 });
  }
}

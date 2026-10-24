import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const theme = await prisma.themeConfig.findUnique({ where: { id: "default" } });
    return NextResponse.json({ theme });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat tema." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      primaryColor,
      secondaryColor,
      backgroundColor,
      surfaceColor,
      accentColor,
      textColor,
      successColor,
      errorColor,
      fontFamilyHeading,
      fontFamilyBody,
      borderRadius,
      buttonShape,
    } = body;

    const theme = await prisma.themeConfig.upsert({
      where: { id: "default" },
      update: {
        primaryColor,
        secondaryColor,
        backgroundColor,
        surfaceColor,
        accentColor,
        textColor,
        successColor,
        errorColor,
        fontFamilyHeading,
        fontFamilyBody,
        borderRadius,
        buttonShape,
      },
      create: {
        id: "default",
        primaryColor: primaryColor || "#4B291B",
        secondaryColor: secondaryColor || "#A9683B",
        backgroundColor: backgroundColor || "#FAF5EF",
        surfaceColor: surfaceColor || "#FFFDF9",
        accentColor: accentColor || "#EBD9C7",
        textColor: textColor || "#211A16",
        successColor: successColor || "#287A49",
        errorColor: errorColor || "#B42318",
        fontFamilyHeading: fontFamilyHeading || "serif",
        fontFamilyBody: fontFamilyBody || "sans",
        borderRadius: borderRadius || "rounded-xl",
        buttonShape: buttonShape || "rounded-lg",
      },
    });

    // Revalidate public and admin paths for instant refresh
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/produk");
    revalidatePath("/galeri");
    revalidatePath("/artikel");
    revalidatePath("/admin/theme");
    revalidatePath("/admin/settings");

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("Theme PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui tema." }, { status: 500 });
  }
}

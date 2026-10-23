import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating StoreSetting with user requirements...");
  const updated = await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {
      whatsappNumber: "6285888159765",
      address: "Perum Griya Cileungsi 5, Cileungsi, Bogor, Jawa Barat",
      tagline: "Kue & Camilan Rumahan Fresh — Melayani Pesanan Satuan & Paket Box",
      operationalHours: "Senin - Sabtu: 07:00 - 18:00 WIB (Minggu Melayani Pesanan Khusus Acara)",
      metaDescription: "Pesan aneka pastel crispy, risol mayo lumer, kue basah tradisional, brownies, dan paket snack box partai besar (>50 box) di Perum Griya Cileungsi 5.",
    },
    create: {
      id: "default",
      brandName: "Dapur Rasa",
      tagline: "Kue & Camilan Rumahan Fresh — Melayani Pesanan Satuan & Paket Box",
      whatsappNumber: "6285888159765",
      address: "Perum Griya Cileungsi 5, Cileungsi, Bogor, Jawa Barat",
      operationalHours: "Senin - Sabtu: 07:00 - 18:00 WIB (Minggu Melayani Pesanan Khusus Acara)",
      fulfillmentOptions: "PICKUP,DELIVERY",
      defaultShippingFee: 10000,
      minOrderAmount: 0,
      currency: "IDR",
      timezone: "Asia/Jakarta",
    },
  });

  // Also update about section in homepageSection if exists
  await prisma.homepageSection.updateMany({
    where: { sectionKey: "about" },
    data: {
      title: "Cerita & Dedikasi Dapur Rasa",
      subtitle: "Dapur kue rumahan autentik berlokasi di Perum Griya Cileungsi 5. Dibuat fresh setiap hari dengan bahan pilihan tanpa pengawet buatan.",
      description: "Kami mengkhususkan diri dalam pembuatan aneka pastel renyah, risol mayo creamy lumer, kue basah tradisional, bolu lembut, hingga pesanan partai besar snack box untuk berbagai acara spesial Anda.",
    },
  });

  console.log("StoreSetting & Homepage Section updated successfully:", updated.whatsappNumber, updated.address);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

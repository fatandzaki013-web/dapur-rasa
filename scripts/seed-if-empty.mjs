import { PrismaClient } from "@prisma/client";
import { seedAllData } from "./seed-initial-data.mjs";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

async function checkAndSeed() {
  try {
    const productCount = await prisma.product.count();
    console.log(`[SEED CHECK] Jumlah produk saat ini: ${productCount}`);
    if (productCount === 0) {
      console.log("[SEED CHECK] Database online kosong (0 produk). Memulihkan seluruh katalog kue, gambar, dan konten...");
      await seedAllData();
    } else {
      console.log(`[SEED CHECK] Database sudah memiliki ${productCount} produk. Seeding otomatis dilewati agar tidak menimpa data.`);
    }
  } catch (err) {
    console.warn("[SEED CHECK] Catatan saat cek data:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
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

async function checkAndSeed() {
  try {
    const productCount = await prisma.product.count();
    console.log(`[SEED CHECK] Jumlah produk saat ini: ${productCount}`);
    if (productCount === 0) {
      console.log("[SEED CHECK] Database kosong. Menjalankan inisialisasi data produk & admin awal...");
      execSync("node scripts/seed.mjs", { stdio: "inherit", cwd: rootDir, env: process.env });
    } else {
      console.log("[SEED CHECK] Database sudah memiliki data produk. Seeding dilewati.");
    }
  } catch (err) {
    console.warn("[SEED CHECK] Catatan saat cek data:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

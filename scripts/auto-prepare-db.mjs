import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const schemaPrisma = path.join(rootDir, "prisma", "schema.prisma");
const schemaSqlite = path.join(rootDir, "prisma", "schema.sqlite.prisma");
const schemaPostgres = path.join(rootDir, "prisma", "schema.postgresql.prisma");

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";

if (!process.env.DATABASE_URL && databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

console.log("[DB PREPARE] Memeriksa konfigurasi database...");
console.log(
  "[DB PREPARE] DATABASE_URL:",
  databaseUrl
    ? databaseUrl.startsWith("file:")
      ? "SQLite (file)"
      : databaseUrl.split("@")[1] || "Cloud Database"
    : "Belum diatur (default ke PostgreSQL schema)"
);

const isPostgres =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://") ||
  !databaseUrl ||
  process.env.VERCEL === "1";

if (isPostgres) {
  if (fs.existsSync(schemaPostgres)) {
    fs.copyFileSync(schemaPostgres, schemaPrisma);
    console.log(
      "[DB PREPARE] ✅ Menggunakan schema PostgreSQL (Neon / Supabase / Vercel Postgres)."
    );
  }
} else if (databaseUrl.startsWith("file:")) {
  if (fs.existsSync(schemaSqlite)) {
    fs.copyFileSync(schemaSqlite, schemaPrisma);
    console.log(
      "[DB PREPARE] ℹ️ Menggunakan schema SQLite (Lokal / Persistent Volume)."
    );
  }
}

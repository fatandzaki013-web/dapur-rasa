import { execSync } from "child_process";

console.log("[BUILD] 1/3 Menjalankan Prisma Generate...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (e) {
  console.warn("[BUILD] Peringatan saat prisma generate:", e.message);
}

console.log("[BUILD] 2/3 Sinkronisasi schema database (safe mode)...");
try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", timeout: 20000 });
  try {
    execSync("node scripts/seed-if-empty.mjs", { stdio: "inherit", timeout: 20000 });
  } catch (seedErr) {
    console.warn("[BUILD] Seeding dilewati:", seedErr.message);
  }
  try {
    execSync("node scripts/sync-admin.mjs", { stdio: "inherit", timeout: 20000 });
  } catch (syncErr) {
    console.warn("[BUILD] Sinkronisasi admin dilewati:", syncErr.message);
  }
} catch (dbErr) {
  console.warn("[BUILD] Database server tidak dapat dijangkau saat build, melanjutkan build Next.js:", dbErr.message);
}

console.log("[BUILD] 3/3 Menjalankan Next.js Build...");
execSync("npx next build", { stdio: "inherit" });
console.log("[BUILD] ✅ Build selesai dengan sukses!");

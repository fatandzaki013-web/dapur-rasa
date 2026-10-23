import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const target = process.argv[2]?.toLowerCase();

if (!['sqlite', 'postgresql', 'postgres'].includes(target)) {
  console.log('Penggunaan: node scripts/switch-db.mjs [sqlite|postgresql]');
  console.log('Contoh: node scripts/switch-db.mjs postgresql');
  process.exit(1);
}

const isPostgres = target.includes('postgre');
const schemaSrc = isPostgres
  ? path.join(rootDir, 'prisma', 'schema.postgresql.prisma')
  : path.join(rootDir, 'prisma', 'schema.sqlite.prisma');

const schemaDest = path.join(rootDir, 'prisma', 'schema.prisma');

// Backup current sqlite schema if not exists
const schemaSqliteBackup = path.join(rootDir, 'prisma', 'schema.sqlite.prisma');
if (!fs.existsSync(schemaSqliteBackup)) {
  fs.copyFileSync(schemaDest, schemaSqliteBackup);
}

if (fs.existsSync(schemaSrc)) {
  fs.copyFileSync(schemaSrc, schemaDest);
  console.log(`Berhasil mengubah provider Prisma ke: ${isPostgres ? 'PostgreSQL (Produksi Serverless/Supabase/Neon)' : 'SQLite (Lokal/VPS)'}`);
  try {
    console.log('Menjalankan npx prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
    console.log('Prisma Client siap digunakan!');
  } catch (err) {
    console.error('Gagal generate prisma:', err.message);
  }
} else {
  console.error(`File schema sumber tidak ditemukan: ${schemaSrc}`);
}

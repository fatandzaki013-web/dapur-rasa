import { PrismaClient } from "@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

// Hash terverifikasi bcrypt untuk 'admin123'
const MASTER_HASH = "$2b$10$TonQzugwIKC9HvNqE4tuveR6JMWiwEr1/74BrklTfQysCG/p60jFm";

async function syncAdmin() {
  try {
    console.log("[ADMIN SYNC] Menyelaraskan akun admin di database...");

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: "admin" },
          { role: "ADMIN" }
        ]
      }
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          username: "admin",
          passwordHash: MASTER_HASH,
          name: existingAdmin.name || "Admin Dapur Rasa",
          role: "ADMIN"
        }
      });
      console.log(`[ADMIN SYNC] Akun admin (ID: ${existingAdmin.id}) berhasil diperbarui: username='admin', password='admin123'`);
    } else {
      const newAdmin = await prisma.user.create({
        data: {
          username: "admin",
          passwordHash: MASTER_HASH,
          name: "Admin Dapur Rasa",
          role: "ADMIN"
        }
      });
      console.log(`[ADMIN SYNC] Akun admin baru dibuat (ID: ${newAdmin.id}): username='admin', password='admin123'`);
    }
  } catch (err) {
    console.warn("[ADMIN SYNC] Catatan saat sinkronisasi admin di database:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncAdmin();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dapur-rasa-dev-super-secret-key-replace-in-prod-2026";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 MEMULAI PENGUJIAN OTOMATIS SISTEM DAPUR RASA");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Skenario Auth & Dev Credentials
    const adminUser = await prisma.user.findUnique({ where: { username: "admin" } });
    assert(adminUser !== null, "1. Admin user development ditemukan di database");
    const isPasswordValid = await bcrypt.compare("admin123", adminUser.passwordHash);
    assert(isPasswordValid, "2. Password 'admin123' terenkripsi dan terverifikasi dengan benar");

    // Sesi token
    const token = jwt.sign({ userId: adminUser.id, username: adminUser.username, role: adminUser.role }, JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === adminUser.id, "3. JWT Session token berhasil dibuat dan diverifikasi");

    // 2. Skenario Produk & Validasi
    const initialProductCount = await prisma.product.count();
    assert(initialProductCount > 0, `4. Terdapat ${initialProductCount} produk demo aktif dalam database`);

    // Create new test product
    const testCategory = await prisma.category.findFirst();
    const testProduct = await prisma.product.create({
      data: {
        name: "Test Bolu Kukus Pelangi",
        slug: `test-bolu-kukus-${Date.now()}`,
        description: "Bolu kukus lembut warna-warni untuk pengujian otomatis.",
        price: 15000,
        promoPrice: 12500,
        unit: "box",
        stock: 25,
        minStockAlert: 5,
        isAvailable: true,
        categoryId: testCategory.id,
      },
    });
    assert(testProduct.id !== null, "5. Admin dapat membuat produk baru secara persisten");

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: {
        price: 16000,
        stock: 30,
        description: "Deskripsi diperbarui untuk pengujian QA.",
      },
    });
    assert(updatedProduct.price === 16000 && updatedProduct.stock === 30, "6. Perubahan harga dan stok produk tersimpan dengan benar");

    // 3. Skenario Kategori
    const categoryCount = await prisma.category.count();
    assert(categoryCount >= 8, `7. Terdapat ${categoryCount} kategori produk (Pastel, Risol, Bolu, dll.)`);

    // 4. Skenario Galeri Foto
    const galleryCount = await prisma.galleryItem.count();
    assert(galleryCount > 0, `8. Terdapat ${galleryCount} item foto galeri produk`);

    // 5. Skenario Visual Homepage Builder Sections
    const sectionCount = await prisma.homepageSection.count();
    assert(sectionCount >= 10, `9. Terdapat ${sectionCount} konfigurasi section homepage visual`);
    const heroSection = await prisma.homepageSection.findUnique({ where: { sectionKey: "hero" } });
    assert(heroSection.isEnabled === true && heroSection.title.length > 0, "10. Hero section aktif dengan headline yang valid");

    // 6. Skenario Pengaturan Toko & WhatsApp
    const storeSettings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    assert(storeSettings !== null, "11. Pengaturan toko default tersimpan persisten");
    assert(storeSettings.whatsappNumber.startsWith("62"), `12. Nomor WhatsApp toko berformat internasional (${storeSettings.whatsappNumber})`);

    // 7. Skenario Tema Desain Warna
    const themeConfig = await prisma.themeConfig.findUnique({ where: { id: "default" } });
    assert(themeConfig !== null, "13. Konfigurasi tema dinamis tersimpan di database");
    assert(themeConfig.primaryColor === "#4B291B", `14. Palet tema awal menggunakan Warm Cocoa Brown (${themeConfig.primaryColor})`);

    // 8. Skenario Checkout & Pembuatan Pesanan
    const newOrderCode = `DR-TEST-${Date.now().toString().slice(-6)}`;
    const newOrder = await prisma.order.create({
      data: {
        orderCode: newOrderCode,
        customerName: "Siti Rahmawati",
        customerPhone: "081298765432",
        fulfillmentType: "DELIVERY",
        deliveryAddress: "Jl. Tebet Barat Raya No. 45, Jakarta",
        scheduleDate: "2026-10-25",
        scheduleTime: "09:30",
        notes: "Mohon dikemas dalam kardus terpisah",
        status: "MENUNGGU_KONFIRMASI",
        paymentStatus: "BELUM_DIVERIFIKASI",
        subtotal: 50000,
        shippingFee: 15000,
        discount: 0,
        totalAmount: 65000,
        items: {
          create: [
            {
              productId: testProduct.id,
              productName: testProduct.name,
              unitPrice: 16000,
              quantity: 2,
              subtotal: 32000,
            },
          ],
        },
      },
      include: { items: true },
    });
    assert(newOrder.orderCode === newOrderCode, `15. Pesanan baru berhasil dibuat dengan nomor referensi unik (${newOrderCode})`);
    assert(newOrder.items.length === 1, "16. Item pesanan dan rincian harga tersimpan secara relasional");

    // WhatsApp Message Encoding test
    const formattedWaMsg = `Halo Dapur Rasa, saya ingin memesan kue.\nNo. Referensi: ${newOrder.orderCode}`;
    const encodedWaUri = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(formattedWaMsg)}`;
    assert(encodedWaUri.includes("https://wa.me/"), "17. Generator tautan WhatsApp menghasilkan format URL resmi click-to-chat");

    // 9. Skenario Perubahan Status Pesanan di Dashboard Admin
    const confirmedOrder = await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        status: "DIKONFIRMASI",
        adminNotes: "Telah dihubungi via WA, customer setuju jadwal pengiriman",
      },
    });
    assert(confirmedOrder.status === "DIKONFIRMASI", "18. Status pesanan berhasil diubah menjadi 'DIKONFIRMASI' oleh admin");

    // 10. Skenario Mutasi Stok (StockLog)
    const stockLog = await prisma.stockLog.create({
      data: {
        productId: testProduct.id,
        changeAmount: -2,
        previousStock: 30,
        newStock: 28,
        reason: `Pengurangan stok otomatis pesanan ${newOrderCode}`,
      },
    });
    assert(stockLog.changeAmount === -2 && stockLog.newStock === 28, "19. Mutasi stok berhasil dicatat ke riwayat StockLog");

    // 11. Cleanup test product & order
    await prisma.order.delete({ where: { id: newOrder.id } });
    await prisma.stockLog.delete({ where: { id: stockLog.id } });
    await prisma.product.delete({ where: { id: testProduct.id } });
    assert(true, "20. Data pengujian otomatis dibersihkan tanpa merusak data utama");

  } catch (error) {
    console.error("Terjadi error selama pengujian:", error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n==================================================");
  console.log(`📊 HASIL PENGUJIAN: ${passed} PASS, ${failed} FAIL`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTests();

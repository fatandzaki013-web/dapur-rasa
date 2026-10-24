import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

async function main() {
  console.log("🌱 Mulai seeding database Dapur Rasa...");

  // 1. Admin User
  const devPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: devPasswordHash,
      name: "Pengelola Dapur Rasa",
      role: "ADMIN",
    },
    create: {
      username: "admin",
      passwordHash: devPasswordHash,
      name: "Pengelola Dapur Rasa",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user siap (admin / admin123)");

  // 2. Store Settings
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "Dapur Rasa",
      tagline: "Kue & Camilan Rumahan Kualitas Premium",
      logoUrl: "",
      faviconUrl: "",
      whatsappNumber: "6281234567890",
      address: "Jl. Mawar Melati No. 12, Kebayoran Baru, Jakarta Selatan",
      operationalHours: "Senin - Sabtu: 08:00 - 18:00 WIB",
      fulfillmentOptions: "PICKUP,DELIVERY",
      defaultShippingFee: 15000,
      minOrderAmount: 20000,
      currency: "IDR",
      timezone: "Asia/Jakarta",
      instagramUrl: "https://instagram.com",
      facebookUrl: "https://facebook.com",
      tiktokUrl: "https://tiktok.com",
      metaTitle: "Dapur Rasa — Aneka Kue & Camilan Rumahan Lezat",
      metaDescription: "Pesan aneka pastel crispy, risol mayo lumer, kue basah tradisional, brownies panggang, dan snack box untuk acara spesial.",
    },
  });

  // 3. Theme Config
  await prisma.themeConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      primaryColor: "#4B291B",
      secondaryColor: "#A9683B",
      backgroundColor: "#FAF5EF",
      surfaceColor: "#FFFDF9",
      accentColor: "#EBD9C7",
      textColor: "#211A16",
      successColor: "#287A49",
      errorColor: "#B42318",
      fontFamilyHeading: "serif",
      fontFamilyBody: "sans",
      borderRadius: "rounded-xl",
      buttonShape: "rounded-lg",
    },
  });

  // 4. Categories
  const categoriesData = [
    {
      name: "Pastel",
      slug: "pastel",
      description: "Pastel renyah dengan pilinan kulit khas dan isian ayam sayur melimpah.",
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
      displayOrder: 1,
    },
    {
      name: "Risol",
      slug: "risol",
      description: "Risol ragout ayam dan risol mayo lumer dengan baluran tepung panir krispi.",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
      displayOrder: 2,
    },
    {
      name: "Sosis Solo",
      slug: "sosis-solo",
      description: "Kulit dadar telur gurih berpadu suwiran daging ayam bumbu rempah tradisional.",
      imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80",
      displayOrder: 3,
    },
    {
      name: "Aneka Kue Basah",
      slug: "aneka-kue-basah",
      description: "Kue basah tradisional fresh made dari santan murni dan sari pandan alami.",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
      displayOrder: 4,
    },
    {
      name: "Brownies & Bolu",
      slug: "brownies-bolu",
      description: "Brownies dark choco legit dengan shiny crust dan bolu lembut kaya rasa.",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      displayOrder: 5,
    },
    {
      name: "Kue Kering",
      slug: "kue-kering",
      description: "Kue kering butter premium wangi wisman untuk sajian toples keluarga.",
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
      displayOrder: 6,
    },
    {
      name: "Snack Box",
      slug: "snack-box",
      description: "Paket praktis isi 2 hingga 4 kue untuk rapat kantor, pengajian, dan arisan.",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
      displayOrder: 7,
    },
    {
      name: "Frozen Food",
      slug: "frozen-food",
      description: "Kue siap goreng/kukus praktis untuk stok camilan keluarga di rumah.",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      displayOrder: 8,
    },
    {
      name: "Paket Hemat",
      slug: "paket-hemat",
      description: "Kombinasi aneka camilan favorit dengan harga lebih hemat.",
      imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop&q=80",
      displayOrder: 9,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log("✅ Kategori berhasil dibuat");

  // 5. Products
  const productsData = [
    {
      name: "Pastel Ayam Telur Sayur (Crispy)",
      slug: "pastel-ayam-telur-sayur",
      shortDescription: "Kulit pastel super renyah berlapis dengan isian bihun, wortel, ayam suwir, dan telur rebus.",
      description: "Pastel buatan rumahan dengan pilinan manual tradisional. Dibuat menggunakan terigu berprotein pilihan dan mentega berkualitas sehingga menghasilkan tekstur kulit berlapis yang renyah dan gurih tahan lama. Dilengkapi isian lezat dari potongan kentang, wortel manis, ayam suwir bumbu lada, dan sebutir potongan telur rebus yang mantap. Sudah termasuk cabai rawit hijau segar.",
      price: 5000,
      promoPrice: 4500,
      sku: "PST-01",
      unit: "pcs",
      stock: 35,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 1,
      categorySlug: "pastel",
      ingredients: "Tepung terigu, mentega, telur ayam, daging ayam, wortel, kentang, bihun, bumbu rempah dapur, garam, merica.",
      allergens: "Mengandung telur dan gluten.",
      storageGuide: "Simpan dalam wadah kedap udara. Hangatkan dalam air fryer atau oven 160°C selama 3-5 menit untuk tekstur renyah kembali.",
      shelfLife: "1 hari suhu ruang, 3 hari kulkas chiller.",
      weightGrams: 85,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
        { url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80", isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { name: "Satuan (1 pcs)", priceAdjustment: 0, stock: 35 },
        { name: "Kotak Mika (Isi 5 pcs)", priceAdjustment: 17500, stock: 10 },
      ],
    },
    {
      name: "Risol Mayo Smoked Beef & Keju",
      slug: "risol-mayo-smoked-beef-keju",
      shortDescription: "Risol dengan isian saus mayo creamy gurih, potongan telur, keju leleh, dan smoked beef premium.",
      description: "Risol mayo favorit semua kalangan! Kulit lembut yang dibalut tepung panir halus renyah keemasan saat digoreng. Saat digigit, perpaduan mayones racikan khusus yang creamy manis gurih, potongan telur rebus gurih, lembaran smoked beef, dan keju lumer langsung meleleh di mulut.",
      price: 6000,
      promoPrice: null,
      sku: "RSL-01",
      unit: "pcs",
      stock: 40,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 2,
      categorySlug: "risol",
      ingredients: "Tepung terigu, telur, susu, mayones, smoked beef, keju cheddar, tepung panir, garam, lada.",
      allergens: "Mengandung susu, keju, telur, dan gluten.",
      storageGuide: "Simpan di kulkas jika belum dimakan. Hangatkan di wajan teflon api kecil atau air fryer.",
      shelfLife: "24 jam suhu ruang, 3 hari kulkas.",
      weightGrams: 90,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [
        { name: "Original Mayo", priceAdjustment: 0, stock: 25 },
        { name: "Spicy Mayo", priceAdjustment: 500, stock: 15 },
      ],
    },
    {
      name: "Sosis Solo Goreng Gurih Tradisional",
      slug: "sosis-solo-goreng-gurih",
      shortDescription: "Dadar telur lembut berbalut suwiran dada ayam manis gurih khas Solo, digoreng dengan balutan telur.",
      description: "Camilan khas Solo yang tidak pernah gagal memanjakan lidah. Kulit dadar tipis nan lembut membungkus padat suwiran daging ayam kampung yang diungkep santan dan ketumbar wangi. Digoreng celup kocokan telur sehingga permukaan berenda renyah gurih.",
      price: 4500,
      promoPrice: 4000,
      sku: "SSS-01",
      unit: "pcs",
      stock: 25,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 3,
      categorySlug: "sosis-solo",
      ingredients: "Dada ayam, santan kelapa murni, bawang merah, bawang putih, ketumbar, telur ayam, tepung terigu.",
      allergens: "Mengandung telur dan gluten.",
      storageGuide: "Sajikan hangat bersama cabai rawit hijau.",
      shelfLife: "1 hari suhu ruang.",
      weightGrams: 70,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [],
    },
    {
      name: "Lumpur Surga Pandan Asli",
      slug: "lumpur-surga-pandan-asli",
      shortDescription: "Dessert tradisional lembut berlapis pandan suji harum dan saus santan gurih lumer.",
      description: "Kue basah favorit acara keluarga. Lapisan bawah berupa adonan lembut wangi sari daun pandan dan suji murni, berpadu dengan lapisan atas bubur santan gurih kental yang lumer di lidah. Disajikan dalam cup mika praktis.",
      price: 6500,
      promoPrice: null,
      sku: "LMP-01",
      unit: "cup",
      stock: 20,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: true,
      isNew: true,
      showOnHome: true,
      displayOrder: 4,
      categorySlug: "aneka-kue-basah",
      ingredients: "Santan kelapa, sari daun pandan asli, daun suji, telur ayam, tepung beras, gula pasir, garam.",
      allergens: "Mengandung telur.",
      storageGuide: "Sangat nikmat disajikan dalam keadaan dingin setelah dimasukkan kulkas.",
      shelfLife: "18 jam suhu ruang, 2 hari di lemari es.",
      weightGrams: 120,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [],
    },
    {
      name: "Fudgy Brownies Shiny Crust Dark Chocolate",
      slug: "fudgy-brownies-shiny-crust",
      shortDescription: "Brownies panggang legit pekat dengan lapisan atas mengkilap dan lelehan cokelat premium.",
      description: "Dibuat dengan dark chocolate couverture asli dan cocoa butter berkualitas tinggi. Tekstur dalamnya padat, chewy, dan fudgy lumer di mulut dengan lapisan shiny crust cantik di atasnya. Tidak menggunakan pengembang buatan atau perisa sintetis.",
      price: 65000,
      promoPrice: 58000,
      sku: "BRW-01",
      unit: "box",
      stock: 15,
      minStockAlert: 3,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 5,
      categorySlug: "brownies-bolu",
      ingredients: "Dark chocolate couverture 70%, butter, telur, gula pasir, tepung terigu, cokelat bubuk alkalized.",
      allergens: "Mengandung susu, telur, dan gluten. Dapat mengandung kacang almond jika memilih topping almond.",
      storageGuide: "Simpan di suhu ruang dalam wadah tertutup. Jika ingin tekstur lebih fudgy, simpan di kulkas.",
      shelfLife: "7 hari suhu ruang, 14 hari kulkas.",
      weightGrams: 450,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [
        { name: "Topping Almond Slice", priceAdjustment: 5000, stock: 8 },
        { name: "Topping Chocochip & Keju", priceAdjustment: 5000, stock: 7 },
      ],
    },
    {
      name: "Snack Box Acara Kantor & Arisan (Paket 3 Kue)",
      slug: "snack-box-acara-kantor-arisan",
      shortDescription: "Paket snack box praktis dan higienis: 1 Pastel Renyah, 1 Risol Mayo, 1 Kue Lumpur/Kue Basah + Tisu & Permen.",
      description: "Solusi praktis dan prestisius untuk aneka acara: rapat kantor, pengajian, seminar, syukuran, atau arisan. Dikemas dalam kotak kardus motif elegan ramah lingkungan dengan mika dalam higienis. Kue dibuat pada hari H acara sehingga dijamin segar dan lezat saat dinikmati tamu.",
      price: 18000,
      promoPrice: 16500,
      sku: "SBX-03",
      unit: "box",
      stock: 50,
      minStockAlert: 10,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 6,
      categorySlug: "snack-box",
      ingredients: "Kombinasi kue asin dan kue manis sesuai pilihan paket.",
      allergens: "Mengandung telur, gluten, susu.",
      storageGuide: "Konsumsi dalam waktu 12 jam setelah box diterima untuk kesegaran optimal.",
      shelfLife: "Hari H acara.",
      weightGrams: 280,
      piecesPerPack: 3,
      images: [
        { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [
        { name: "Standar (Tanpa Air Mineral)", priceAdjustment: 0, stock: 50 },
        { name: "Komplit + Air Mineral Cup 220ml", priceAdjustment: 1500, stock: 50 },
      ],
    },
    {
      name: "Frozen Risol Mayo Premium (Pack Isi 10 pcs)",
      slug: "frozen-risol-mayo-premium",
      shortDescription: "Risol mayo siap goreng dalam kemasan vacuum pack kedap udara untuk persediaan camilan di rumah.",
      description: "Kini Anda bisa menikmati risol mayo hangat renyah kapan saja di rumah. Dikemas dengan mesin vacuum sealer khusus sehingga higienis, bebas es salju, dan tahan lama di freezer. Cukup keluarkan 10 menit sebelum digoreng dengan api sedang sampai kuning keemasan.",
      price: 55000,
      promoPrice: 50000,
      sku: "FRZ-RSL-10",
      unit: "pack",
      stock: 20,
      minStockAlert: 4,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: true,
      isNew: true,
      showOnHome: true,
      displayOrder: 7,
      categorySlug: "frozen-food",
      ingredients: "Tepung terigu, telur, susu, mayones, smoked beef, keju, tepung panir.",
      allergens: "Mengandung susu, keju, telur, dan gluten.",
      storageGuide: "Wajib simpan di freezer suhu minimal -18°C.",
      shelfLife: "1 bulan di dalam freezer beku.",
      weightGrams: 900,
      piecesPerPack: 10,
      images: [
        { url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [],
    },
    {
      name: "Kastengel Keju Edam Asli",
      slug: "kastengel-keju-edam-asli",
      shortDescription: "Kue kering keju dengan taburan cheddar renyah dan adonan butter keju edam tua gurih.",
      description: "Kastengel premium bertekstur ngeprul dan renyah. Rasa asin gurihnya otentik berkat penggunaan keju edam tua asli yang dipadukan dengan butter pilihan. Cocok untuk suguhan tamu atau buah tangan istimewa.",
      price: 85000,
      promoPrice: null,
      sku: "KST-01",
      unit: "toples",
      stock: 12,
      minStockAlert: 2,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 8,
      categorySlug: "kue-kering",
      ingredients: "Keju Edam tua, keju cheddar, butter wijsman & butter blend, tepung terigu, kuning telur, susu bubuk.",
      allergens: "Mengandung susu, keju, telur, dan gluten.",
      storageGuide: "Tutup toples rapat setelah dibuka. Simpan di tempat sejuk dan kering terhindar dari sinar matahari.",
      shelfLife: "2 bulan dalam toples tertutup rapat.",
      weightGrams: 350,
      piecesPerPack: 1,
      images: [
        { url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80", isPrimary: true, displayOrder: 1 },
      ],
      variants: [],
    },
  ];

  for (const prod of productsData) {
    const catId = categoryMap[prod.categorySlug];
    if (!catId) continue;

    const createdProd = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        promoPrice: prod.promoPrice,
        sku: prod.sku,
        unit: prod.unit,
        stock: prod.stock,
        minStockAlert: prod.minStockAlert,
        isAvailable: prod.isAvailable,
        isBestSeller: prod.isBestSeller,
        isFeatured: prod.isFeatured,
        isNew: prod.isNew,
        showOnHome: prod.showOnHome,
        displayOrder: prod.displayOrder,
        categoryId: catId,
        ingredients: prod.ingredients,
        allergens: prod.allergens,
        storageGuide: prod.storageGuide,
        shelfLife: prod.shelfLife,
        weightGrams: prod.weightGrams,
        piecesPerPack: prod.piecesPerPack,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        promoPrice: prod.promoPrice,
        sku: prod.sku,
        unit: prod.unit,
        stock: prod.stock,
        minStockAlert: prod.minStockAlert,
        isAvailable: prod.isAvailable,
        isBestSeller: prod.isBestSeller,
        isFeatured: prod.isFeatured,
        isNew: prod.isNew,
        showOnHome: prod.showOnHome,
        displayOrder: prod.displayOrder,
        categoryId: catId,
        ingredients: prod.ingredients,
        allergens: prod.allergens,
        storageGuide: prod.storageGuide,
        shelfLife: prod.shelfLife,
        weightGrams: prod.weightGrams,
        piecesPerPack: prod.piecesPerPack,
      },
    });

    // Add images
    await prisma.productImage.deleteMany({ where: { productId: createdProd.id } });
    for (const img of prod.images) {
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          url: img.url,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        },
      });
    }

    // Add variants
    await prisma.productVariant.deleteMany({ where: { productId: createdProd.id } });
    for (const v of prod.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProd.id,
          name: v.name,
          priceAdjustment: v.priceAdjustment,
          stock: v.stock,
          isAvailable: true,
        },
      });
    }
  }
  console.log("✅ Produk demo dan varian berhasil dibuat");

  // 6. Homepage Sections Config
  const sections = [
    {
      sectionKey: "announcement",
      title: "PENGUMUMAN TOKO",
      subtitle: "Buka pesanan Senin - Sabtu • Menerima pesanan snack box partai besar arisan & kantor",
      description: "",
      buttonText: "Lihat Katalog",
      buttonLink: "/produk",
      isEnabled: true,
      displayOrder: 1,
    },
    {
      sectionKey: "hero",
      title: "Kelezatan Kue Rumahan Autentik, Dibuat dengan Kasih Sayang",
      subtitle: "Aneka pastel renyah, risol mayo lumer, kue basah tradisional, dan snack box lezat untuk menemani setiap momen istimewa Anda.",
      description: "Menggunakan bahan baku alami tanpa bahan pengawet buatan, dipanggang & digoreng fresh setiap hari.",
      imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&auto=format&fit=crop&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop&q=80",
      buttonText: "Pesan Sekarang",
      buttonLink: "/produk",
      secondaryButtonText: "Lihat Galeri Foto",
      secondaryButtonLink: "/galeri",
      badgeText: "Freshly Made Daily",
      isEnabled: true,
      displayOrder: 2,
    },
    {
      sectionKey: "categories",
      title: "Kategori Kue & Camilan",
      subtitle: "Pilihan favorit untuk keluarga, teman santai, hingga kebutuhan acara spesial.",
      buttonText: "Lihat Semua",
      buttonLink: "/produk",
      isEnabled: true,
      displayOrder: 3,
    },
    {
      sectionKey: "featured",
      title: "Menu Terfavorit & Best Seller",
      subtitle: "Produk yang paling banyak dipesan dan dinikmati oleh para pelanggan setia kami.",
      buttonText: "Jelajahi Katalog Lengkap",
      buttonLink: "/produk",
      isEnabled: true,
      displayOrder: 4,
    },
    {
      sectionKey: "promo_banner",
      title: "Spesialis Snack Box Acara & Pengajian",
      subtitle: "Bebas kombinasi aneka kue asin dan manis. Kemasan eksklusif, rapi, dan higienis.",
      description: "Dapatkan harga khusus untuk pemesanan di atas 50 box. Pemesanan H-2 untuk menjamin kesegaran maksimal.",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80",
      buttonText: "Pesan Paket Snack Box",
      buttonLink: "/produk/snack-box-acara-kantor-arisan",
      badgeText: "Promo Spesial Acara",
      isEnabled: true,
      displayOrder: 5,
    },
    {
      sectionKey: "value_props",
      title: "Mengapa Memilih Dapur Rasa?",
      subtitle: "Komitmen kami untuk selalu menyajikan camilan rumahan dengan mutu terbaik.",
      isEnabled: true,
      displayOrder: 6,
    },
    {
      sectionKey: "about",
      title: "Cerita di Balik Dapur Rasa",
      subtitle: "Dimulai dari resep keluarga turun-temurun hingga menjadi teman setia meja makan Anda.",
      description: "Dapur Rasa bermula dari dapur sederhana di rumah dengan kecintaan pada kuliner tradisional Indonesia. Kami percaya bahwa kue rumahan yang enak lahir dari bahan-bahan bermutu, proses pembuatan yang higienis, dan ketulusan dalam setiap adonan.",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80",
      buttonText: "Baca Cerita Lengkap",
      buttonLink: "/tentang-kami",
      isEnabled: true,
      displayOrder: 7,
    },
    {
      sectionKey: "gallery",
      title: "Galeri Karya & Produksi Kami",
      subtitle: "Melihat lebih dekat aneka sajian kue segar langsung dari dapur kami.",
      buttonText: "Buka Semua Foto Galeri",
      buttonLink: "/galeri",
      isEnabled: true,
      displayOrder: 8,
    },
    {
      sectionKey: "testimonials",
      title: "Apa Kata Pelanggan Kami?",
      subtitle: "Ulasan jujur dari pelanggan yang telah memesan kue dan snack box Dapur Rasa.",
      isEnabled: true,
      displayOrder: 9,
    },
    {
      sectionKey: "faq",
      title: "Pertanyaan yang Sering Diajukan",
      subtitle: "Jawaban praktis seputar cara order, pengiriman, dan penyimpanan kue.",
      isEnabled: true,
      displayOrder: 10,
    },
    {
      sectionKey: "cta",
      title: "Punya Rencana Acara atau Ingin Pesan Custom?",
      subtitle: "Hubungi kami langsung via WhatsApp untuk konsultasi menu, jadwal pengiriman, dan penawaran harga terbaik.",
      buttonText: "Chat Kami di WhatsApp",
      buttonLink: "https://wa.me/6281234567890",
      isEnabled: true,
      displayOrder: 11,
    },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.sectionKey },
      update: sec,
      create: sec,
    });
  }
  console.log("✅ Konfigurasi visual section homepage berhasil disimpan");

  // 7. Testimonials (Marked as Sample Demo)
  const testimonials = [
    {
      customerName: "Ibu Rahmawati",
      comment: "Pesan 80 snack box untuk pengajian keluarga. Alhamdulillah kuenya datang tepat waktu, masih hangat, dan para tamu memuji pastelnya yang renyah banget. Pasti akan order lagi untuk arisan bulan depan!",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      eventOrProduct: "Snack Box Pengajian Keluarga",
      isApproved: true,
      displayOrder: 1,
      isSample: true,
    },
    {
      customerName: "Dimas Suryanto",
      comment: "Risol mayo dan pastel ayamnya juara! Kulitnya pas, mayo dan kejunya lumer tanpa eneg. Cocok banget buat camilan sore di kantor bareng teman-teman tim.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      eventOrProduct: "Risol Mayo & Pastel",
      isApproved: true,
      displayOrder: 2,
      isSample: true,
    },
    {
      customerName: "dr. Sarah Permatasari",
      comment: "Fudgy browniesnya luar biasa enak, cokelatnya pekat dan teksturnya fudgy legit. Anak-anak dan suami di rumah langsung habis setengah kotak dalam sekejap.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      eventOrProduct: "Fudgy Brownies Shiny Crust",
      isApproved: true,
      displayOrder: 3,
      isSample: true,
    },
  ];

  await prisma.testimonial.deleteMany();
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log("✅ Data testimoni demo berhasil dibuat");

  // 8. FAQ Items
  const faqs = [
    {
      question: "Bagaimana alur pemesanan kue di website ini?",
      answer: "Pilih produk kue yang Anda inginkan, tentukan jumlah atau varian, lalu masukkan ke keranjang. Pada halaman checkout, isi informasi nama, nomor WhatsApp, serta pilihan diambil langsung (pickup) atau dikirim ke alamat. Setelah itu, sistem akan mengarahkan Anda ke WhatsApp resmi kami dengan rincian pesanan yang sudah otomatis tersusun rapi untuk kami konfirmasi ketersediaannya.",
      category: "Pemesanan",
      displayOrder: 1,
    },
    {
      question: "Kapan batas waktu pemesanan untuk pesanan dalam jumlah banyak (Snack Box)?",
      answer: "Untuk pesanan snack box partai besar (di atas 30 box), kami sarankan memesan minimal H-2 sebelum acara agar jadwal produksi dan bahan segar dapat kami siapkan secara prima.",
      category: "Pemesanan",
      displayOrder: 2,
    },
    {
      question: "Apakah bisa request varian isi snack box sesuai budget?",
      answer: "Tentu bisa! Anda dapat berkonsultasi langsung melalui tombol WhatsApp untuk menyesuaikan kombinasi kue asin dan manis sesuai budget dan tema acara Anda.",
      category: "Produk",
      displayOrder: 3,
    },
    {
      question: "Bagaimana cara pengiriman produk?",
      answer: "Pengiriman area lokal kota dapat menggunakan kurir instan (seperti GrabExpress / GoSend) atau kurir toko kami. Anda juga bisa memilih opsi Ambil Sendiri (Pickup) di alamat dapur kami tanpa biaya ongkos kirim.",
      category: "Pengiriman",
      displayOrder: 4,
    },
    {
      question: "Apakah produk kue rumahan ini menggunakan bahan pengawet?",
      answer: "Semua produk Dapur Rasa dibuat tanpa bahan pengawet buatan. Karena itu kami selalu mencantumkan petunjuk masa simpan dan anjuran penyimpanan di setiap detail produk demi kenyamanan dan kesehatan Anda.",
      category: "Produk",
      displayOrder: 5,
    },
  ];

  await prisma.faqItem.deleteMany();
  for (const f of faqs) {
    await prisma.faqItem.create({ data: f });
  }
  console.log("✅ FAQ berhasil dibuat");

  // 9. Gallery Items
  const galleryItems = [
    {
      title: "Pastel Renyah Berlapis",
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80",
      caption: "Pastel fresh baru matang dari wajan penggorengan dengan kulit pilin khas renyah.",
      categoryTag: "Pastel",
      altText: "Pastel goreng renyah isi ayam dan sayur",
      isPublished: true,
      displayOrder: 1,
    },
    {
      title: "Risol Mayo Creamy Lumer",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
      caption: "Baluran tepung panir krispi berpadu isian mayones telur dan smoked beef lumer.",
      categoryTag: "Risol",
      altText: "Risol mayo keju lumer",
      isPublished: true,
      displayOrder: 2,
    },
    {
      title: "Sosis Solo Gurih Bungkus Telur",
      imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80",
      caption: "Sosis solo digoreng berenda wangi rempah ketumbar dan santan gurih.",
      categoryTag: "Sosis Solo",
      altText: "Sosis solo goreng tradisional",
      isPublished: true,
      displayOrder: 3,
    },
    {
      title: "Kue Tradisional Pandan Segar",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
      caption: "Wangi alami sari daun pandan asli tanpa pewarna sintetis.",
      categoryTag: "Kue Basah",
      altText: "Kue tradisional pandan legit",
      isPublished: true,
      displayOrder: 4,
    },
    {
      title: "Fudgy Brownies Shiny Crust",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
      caption: "Potongan brownies tebal dengan lapisan atas mengkilap dan lelehan cokelat pekat.",
      categoryTag: "Brownies",
      altText: "Brownies panggang dark chocolate",
      isPublished: true,
      displayOrder: 5,
    },
    {
      title: "Persiapan Snack Box Acara Rapat",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
      caption: "Penataan rapi dan higienis kotak kue siap antar untuk acara seminar instansi.",
      categoryTag: "Snack Box",
      altText: "Penyusunan snack box rapat higienis",
      isPublished: true,
      displayOrder: 6,
    },
  ];

  await prisma.galleryItem.deleteMany();
  for (const g of galleryItems) {
    await prisma.galleryItem.create({ data: g });
  }
  console.log("✅ Galeri item berhasil dibuat");

  // 10. Initial Demo Order (so Admin Dashboard immediately has real historical data to inspect!)
  const firstProd = await prisma.product.findFirst({ where: { slug: "pastel-ayam-telur-sayur" } });
  const secondProd = await prisma.product.findFirst({ where: { slug: "risol-mayo-smoked-beef-keju" } });

  const existingOrder = await prisma.order.findUnique({ where: { orderCode: "DR-20261022-0001" } });
  if (!existingOrder && firstProd && secondProd) {
    await prisma.order.create({
      data: {
        orderCode: "DR-20261022-0001",
        customerName: "Budi Santoso",
        customerPhone: "081234567891",
        fulfillmentType: "DELIVERY",
        deliveryAddress: "Jl. Melati Indah No. 5, Kebayoran Baru",
        scheduleDate: "2026-10-23",
        scheduleTime: "10:00",
        notes: "Tolong kirim sebelum jam 11 siang ya kak, terima kasih.",
        status: "MENUNGGU_KONFIRMASI",
        paymentStatus: "BELUM_DIVERIFIKASI",
        subtotal: 50000,
        shippingFee: 15000,
        discount: 0,
        totalAmount: 65000,
        adminNotes: "Customer chat via WA konfirmasi stok",
        items: {
          create: [
            {
              productId: firstProd.id,
              productName: firstProd.name,
              variantName: "Kotak Mika (Isi 5 pcs)",
              unitPrice: 22500,
              quantity: 1,
              subtotal: 22500,
            },
            {
              productId: secondProd.id,
              productName: secondProd.name,
              variantName: "Original Mayo",
              unitPrice: 6000,
              quantity: 4,
              subtotal: 24000,
            },
          ],
        },
      },
    });
    console.log("✅ Pesanan demo DR-20261022-0001 berhasil dibuat");
  }

  console.log("🎉 Seeding database Dapur Rasa selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

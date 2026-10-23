const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleArticles = [
  {
    title: "5 Rahasia Resep Bolu Gulung Lembut & Harum Khas Dapur Rasa",
    slug: "5-rahasia-resep-bolu-gulung-lembut-harum-khas-dapur-rasa",
    excerpt: "Membuat bolu gulung yang lembut, tidak retak saat digulung, dan memiliki aroma mentega yang semerbak memerlukan teknik khusus. Simak rahasia dapur kami di sini.",
    content: `## Rahasia Tekstur Bolu Gulung yang Lembut Sempurna

Bolu gulung sering kali menjadi sajian favorit keluarga di berbagai perayaan. Namun, banyak pembuat kue pemula yang menghadapi tantangan seperti bolu pecah saat digulung atau teksturnya yang kering. Di **Dapur Rasa**, kami selalu memegang teguh standar mutu tinggi dengan metode tradisional yang dipadukan dengan teknik modern.

### 1. Kualitas Telur dan Suhu Ruang
Gunakan selalu telur segar bersuhu ruang. Telur yang baru keluar dari lemari es akan lebih sulit mengembang sempurna ketika dikocok hingga tahap *ribbon stage*.

### 2. Emulsi Sempurna dan Pengocokan
Kocok telur bersama gula hingga benar-benar kental, berjejak, dan berwarna putih pucat. Tahap ini adalah kunci struktur busa yang menopang kelembutan pori-pori bolu tanpa perlu pengembang kimiawi berlebih.

### 3. Mentega Berkualitas Tinggi (Pure Butter)
Kami hanya menggunakan kombinasi *pure creamery butter* premium yang memberikan aroma khas, rasa gurih legit alami, dan kelembapan (*moist*) yang tahan lama.

### 4. Teknik Menggulung Saat Hangat
Keluarkan bolu segera setelah matang, balikkan ke atas kertas roti, oleskan selai atau krim pilihan, lalu gulung perlahan selagi kue masih dalam kondisi hangat suam-suam kuku.

---
> **Pesan Sekarang**: Ingin menikmati bolu gulung segar tanpa repot memanggang? Anda bisa memesannya langsung di katalog kue basah Dapur Rasa!`,
    coverImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    category: "Resep & Tips",
    tags: "bolu, kue basah, tips dapur, resep kue",
    status: "PUBLISHED",
    authorName: "Super Admin",
    seoTitle: "5 Rahasia Resep Bolu Gulung Lembut & Harum - Dapur Rasa",
    seoDescription: "Pelajari cara membuat bolu gulung yang lembut, anti pecah, dan lezat dari para ahli di Dapur Rasa.",
    publishedAt: new Date(),
  },
  {
    title: "Cara Menyimpan Kue Basah Tradisional Agar Tetap Segar dan Higienis",
    slug: "cara-menyimpan-kue-basah-tradisional-agar-tetap-segar-higienis",
    excerpt: "Kue basah tradisional seperti pastel, risol, dan lemper memiliki daya tahan tertentu. Ini panduan cara menyimpan yang tepat agar rasa dan teksturnya tetap prima.",
    content: `## Menjaga Kesegaran Kue Basah Tradisional

Kue basah khas Nusantara dikenal kaya akan santan dan bahan-bahan segar alami. Karena bebas dari bahan pengawet sintetis, kue basah membutuhkan perhatian khusus dalam penyimpanan.

### Mengapa Kue Basah Harus Disimpan dengan Benar?
Kandungan air dan santan pada kue seperti talam, dadar gulung, dan kue lumpur membuatnya rentan terhadap suhu lembab yang tidak steril.

### Langkah-Langkah Penyimpanan Praktis:
1. **Suhu Ruang (Hari Pertama):** Kue basah yang baru tiba paling nikmat dinikmati dalam waktu 12 jam setelah diterima. Jauhkan dari paparan sinar matahari langsung.
2. **Pendinginan di Lemari Es:** Jika belum habis, simpan dalam wadah kedap udara (food container tertutup) di chiller. Ini menjaga kue tetap segar hingga 2-3 hari.
3. **Pemanasan Ulang:** Untuk kue goreng seperti pastel dan risol, hangatkan kembali menggunakan *air fryer* atau oven mini pada suhu 150°C selama 3-5 menit agar kerenyahannya kembali seperti sedia kala.

Dapur Rasa selalu mengemas setiap pesanan dengan wadah *food grade* aman untuk menjaga kehigienisan selama perjalanan menuju meja Anda.`,
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    category: "Panduan Konsumsi",
    tags: "tips kue, penyimpanan, pastel, risol",
    status: "PUBLISHED",
    authorName: "Super Admin",
    seoTitle: "Panduan Menyimpan Kue Basah Tradisional - Dapur Rasa",
    seoDescription: "Tips menyimpan kue basah tradisional agar tahan lama dan tetap enak dinikmati bersama keluarga.",
    publishedAt: new Date(Date.now() - 86400000),
  },
  {
    title: "Panduan Memilih Paket Snack Box untuk Acara Kantor & Pengajian",
    slug: "panduan-memilih-paket-snack-box-untuk-acara-kantor-pengajian",
    excerpt: "Bingung memilih kombinasi kue manis dan gurih untuk paket snack box acara Anda? Simak rekomendasi padu padan terbaik yang disukai semua tamu undangan.",
    content: `## Menghidangkan Snack Box yang Berkesan untuk Tamu Anda

Mengadakan acara seperti arisan, rapat kantor, syukuran, atau pengajian di rumah membutuhkan sajian konsumsi yang praktis namun tetap istimewa. Snack box adalah solusi terfavorit karena rapi, higienis, dan mudah dibagikan.

### Rumus Kombinasi Snack Box Ideal:
* **1 Pilihan Gurih Renyah:** Risol Mayo Premium, Pastel Telur Sayur, atau Lemper Ayam Suwir.
* **1 Pilihan Manis Legit:** Bolu Gulung Mini, Brownies Fudgy, atau Dadar Gulung Pandan Suji.
* **1 Pilihan Ringan / Basah:** Kue Lumpur Kelapa Muda atau Puding Buah Segar.
* **1 Air Mineral Cup:** Pelengkap praktis untuk kesegaran tamu.

### Layanan Khusus Perum Griya Cileungsi 5
Bagi Anda warga Perum Griya Cileungsi 5 dan sekitarnya, Dapur Rasa menyediakan layanan pengantaran langsung ke lokasi acara untuk pemesanan paket snack box di atas 50 box!`,
    coverImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    category: "Event & Catering",
    tags: "snack box, catering, acara kantor, arisan, cileungsi",
    status: "PUBLISHED",
    authorName: "Super Admin",
    seoTitle: "Panduan Memilih Paket Snack Box - Dapur Rasa Cileungsi",
    seoDescription: "Rekomendasi kombinasi snack box lezat untuk acara keluarga dan instansi.",
    publishedAt: new Date(Date.now() - 172800000),
  }
];

async function seed() {
  for (const item of sampleArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      await prisma.article.create({ data: item });
      console.log('Seeded article:', item.title);
    } else {
      console.log('Article already exists:', item.title);
    }
  }
  const count = await prisma.article.count();
  console.log('Total articles in database:', count);
}

seed().catch(console.error).finally(() => prisma.$disconnect());

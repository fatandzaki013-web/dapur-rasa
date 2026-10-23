const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany();
  const getCatId = (slug) => categories.find(c => c.slug === slug)?.id;

  const newProducts = [
    {
      name: 'Paket Hemat Combo Pastel & Risol Mayo (10 pcs)',
      slug: 'paket-hemat-combo-pastel-risol-mayo-10-pcs',
      shortDescription: 'Kombinasi 5 pcs Pastel Crispy ayam telur sayur dan 5 pcs Risol Mayo daging keju lumer.',
      description: 'Pilihan paling hemat dan favorit untuk camilan bersama keluarga! Menghadirkan 5 pcs Pastel Renyah Berlapis isi ayam telur sayur serta 5 pcs Risol Mayo Smoked Beef keju lumer. Disajikan hangat lengkap dengan cabai rawit hijau segar.',
      price: 52000,
      unit: 'paket',
      stock: 25,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: true,
      showOnHome: true,
      displayOrder: 2,
      categoryId: getCatId('paket-hemat'),
      images: [
        { url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80', isPrimary: false, displayOrder: 2 }
      ]
    },
    {
      name: 'Paket Hemat Family Gathering (20 pcs Aneka Kue)',
      slug: 'paket-hemat-family-gathering-20-pcs',
      shortDescription: 'Koleksi lengkap 20 pcs kue favorit: pastel, risol mayo, sosis solo, dan bolu gulung.',
      description: 'Paket super lengkap dan hemat untuk suguhan acara keluarga besar, arisan, syukuran, atau kumpul tetangga. Berisi aneka kue rumahan terfavorit dengan cita rasa gurih dan manis yang seimbang, higienis, dan dikemas rapi.',
      price: 98000,
      unit: 'paket',
      stock: 15,
      minStockAlert: 3,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: true,
      showOnHome: true,
      displayOrder: 3,
      categoryId: getCatId('paket-hemat'),
      images: [
        { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', isPrimary: true, displayOrder: 1 }
      ]
    },
    {
      name: 'Klepon Pandan Gula Merah Lumer (Isi 10 pcs)',
      slug: 'klepon-pandan-gula-merah-lumer',
      shortDescription: 'Klepon kenyal lembut beraroma daun pandan asli dengan lelehan gula aren organik dan kelapa parut kukus.',
      description: 'Kue tradisional khas Nusantara dengan tekstur kenyal dari tepung ketan asli dan wangi pandan alami. Saat digigit, gula aren organik langsung meleleh manis di dalam mulut, berpadu gurihnya taburan kelapa parut kukus.',
      price: 18000,
      unit: 'porsi',
      stock: 30,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: false,
      showOnHome: true,
      displayOrder: 4,
      categoryId: getCatId('aneka-kue-basah'),
      images: [
        { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', isPrimary: true, displayOrder: 1 }
      ]
    },
    {
      name: 'Pastel Frozen Siap Goreng (Pack Isi 10 pcs)',
      slug: 'pastel-frozen-siap-goreng-pack-10-pcs',
      shortDescription: 'Pastel beku siap goreng kapan saja, kulit renyah berlapis dengan isian melimpah.',
      description: 'Stok camilan praktis di rumah! Cukup keluarkan dari freezer selama 10 menit lalu goreng dengan minyak hangat sampai mekar keemasan. Dijamin renyah krispi tahan lama.',
      price: 48000,
      unit: 'pack',
      stock: 22,
      minStockAlert: 5,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: true,
      isNew: true,
      showOnHome: true,
      displayOrder: 5,
      categoryId: getCatId('frozen-food'),
      images: [
        { url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80', isPrimary: true, displayOrder: 1 }
      ]
    }
  ];

  for (const prod of newProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          shortDescription: prod.shortDescription,
          description: prod.description,
          price: prod.price,
          unit: prod.unit,
          stock: prod.stock,
          minStockAlert: prod.minStockAlert,
          isAvailable: prod.isAvailable,
          isBestSeller: prod.isBestSeller,
          isFeatured: prod.isFeatured,
          isNew: prod.isNew,
          showOnHome: prod.showOnHome,
          displayOrder: prod.displayOrder,
          categoryId: prod.categoryId,
          images: {
            create: prod.images.map(img => ({
              url: img.url,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder
            }))
          }
        }
      });
      console.log('Added product:', created.name);
    } else {
      console.log('Product already exists:', existing.name);
    }
  }

  // Add more gallery items
  const newGalleries = [
    {
      title: 'Aneka Kue Kotak Snack Box Kantor',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
      caption: 'Penyajian kue basah dan pastry higienis dalam box kemasan premium siap kirim.',
      categoryTag: 'Snack Box',
      altText: 'Snack box aneka kue Dapur Rasa',
      displayOrder: 7
    },
    {
      title: 'Kastengel Keju Edam Gurih Ngeprul',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
      caption: 'Kue kering klasik berbahan keju tua autentik dan mentega butter pilihan.',
      categoryTag: 'Kue Kering',
      altText: 'Toples kastengel keju edam',
      displayOrder: 8
    },
    {
      title: 'Paket Hemat Camilan Kumpul Keluarga',
      imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=80',
      caption: 'Sajian lengkap aneka kue hangat gurih dan manis untuk momen kebersamaan.',
      categoryTag: 'Paket Hemat',
      altText: 'Paket kue keluarga Dapur Rasa',
      displayOrder: 9
    }
  ];

  for (const gal of newGalleries) {
    const existing = await prisma.galleryItem.findFirst({ where: { title: gal.title } });
    if (!existing) {
      const created = await prisma.galleryItem.create({
        data: {
          title: gal.title,
          imageUrl: gal.imageUrl,
          caption: gal.caption,
          categoryTag: gal.categoryTag,
          altText: gal.altText,
          displayOrder: gal.displayOrder,
          isPublished: true
        }
      });
      console.log('Added gallery item:', created.title);
    } else {
      console.log('Gallery item already exists:', existing.title);
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

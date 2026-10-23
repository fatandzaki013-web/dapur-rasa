export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string;
  price: number;
  promoPrice?: number | null;
  unit: string;
  stock: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNew: boolean;
  showOnHome: boolean;
  displayOrder?: number;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category: { id: string; name: string; slug: string };
  variants?: Array<{ id: string; name: string; priceAdjustment: number; stock: number }>;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  categoryTag?: string | null;
  altText?: string | null;
  productId?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
  } | null;
}

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "cmvj6v8er000bwk9c8y6uk6dx",
    name: "Pastel Ayam Telur Sayur (Crispy)",
    slug: "pastel-ayam-telur-sayur",
    shortDescription: "Kulit pastel super renyah berlapis dengan isian bihun, wortel, ayam suwir, dan telur rebus.",
    description: "Pastel buatan rumahan dengan pilinan manual tradisional. Menghasilkan tekstur kulit berlapis yang renyah dan gurih tahan lama.",
    price: 5000,
    promoPrice: null,
    unit: "pcs",
    stock: 35,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 1,
    category: { id: "cmvj6v8bx0001wk9cp6gm2a3i", name: "Pastel", slug: "pastel" },
    images: [
      { url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8gj000lwk9cz13wuadw",
    name: "Risol Mayo Smoked Beef & Keju",
    slug: "risol-mayo-smoked-beef-keju",
    shortDescription: "Risol dengan isian saus mayo creamy gurih, potongan telur, keju leleh, dan smoked beef premium.",
    description: "Risol mayo favorit semua kalangan dengan kulit lembut dibalut tepung panir halus renyah keemasan.",
    price: 6000,
    promoPrice: null,
    unit: "pcs",
    stock: 40,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 2,
    category: { id: "cmvj6v8c70002wk9ck5a74e7y", name: "Risol", slug: "risol" },
    images: [
      { url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8ht000twk9cc7w5294w",
    name: "Sosis Solo Goreng Gurih Tradisional",
    slug: "sosis-solo-goreng-gurih-tradisional",
    shortDescription: "Dadar telur tipis lembut berbalut suwiran ayam rempah manis gurih khas Jawa Tengah.",
    description: "Sosis solo basah dan goreng dengan racikan bumbu bawang dan ketumbar harum.",
    price: 4500,
    promoPrice: null,
    unit: "pcs",
    stock: 30,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 3,
    category: { id: "cmvj6v8ch0003wk9cjknskqsr", name: "Sosis Solo", slug: "sosis-solo" },
    images: [
      { url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8il000xwk9cnjq59bpi",
    name: "Lumpur Surga Pandan Asli",
    slug: "lumpur-surga-pandan-asli",
    shortDescription: "Kue basah lapis pandan hijau legit dengan vla santan kental gurih manis lumer.",
    description: "Kue tradisional khas Banjarmasin dengan lapisan hijau pandan wangi dan lapisan santan gurih lembut.",
    price: 6500,
    promoPrice: null,
    unit: "cup",
    stock: 25,
    isAvailable: true,
    isBestSeller: false,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 4,
    category: { id: "cmvj6v8ct0004wk9cpsm9qxk5", name: "Aneka Kue Basah", slug: "aneka-kue-basah" },
    images: [
      { url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8jd0011wk9c8fq6zgv3",
    name: "Fudgy Brownies Shiny Crust Dark Chocolate",
    slug: "fudgy-brownies-shiny-crust-dark-chocolate",
    shortDescription: "Brownies panggang dengan lapisan crust tipis berkilau, tekstur fudgy lumer di tengah.",
    description: "Brownies dark choco premium menggunakan bubuk cokelat Belgia murni dan mentega berkualitas.",
    price: 65000,
    promoPrice: null,
    unit: "box",
    stock: 15,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 5,
    category: { id: "cmvj6v8d50005wk9cydl8b3m8", name: "Brownies & Bolu", slug: "brownies-bolu" },
    images: [
      { url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8kt0019wk9calp99tzw",
    name: "Snack Box Acara Kantor & Arisan (Paket 3 Kue)",
    slug: "snack-box-acara-kantor-arisan",
    shortDescription: "Paket 3 kue pilihan: Pastel crispy, risol mayo, dan bolu gulung cantik dalam kotak elegan.",
    description: "Solusi sajian praktis dan higienis untuk rapat instansi, seminar kampus, dan arisan keluarga.",
    price: 18000,
    promoPrice: null,
    unit: "box",
    stock: 50,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 6,
    category: { id: "cmvj6v8dq0007wk9c0f47kbod", name: "Snack Box", slug: "snack-box" },
    images: [
      { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8m4001hwk9cg94tky5x",
    name: "Frozen Risol Mayo Premium (Pack Isi 10 pcs)",
    slug: "frozen-risol-mayo-premium-pack",
    shortDescription: "Risol mayo beku siap goreng kapan saja, saus mayo gurih creamy tidak bocor saat digoreng.",
    description: "Stok frozen food berkualitas. Simpan beku di freezer tahan hingga 1 bulan.",
    price: 55000,
    promoPrice: null,
    unit: "pack",
    stock: 20,
    isAvailable: true,
    isBestSeller: false,
    isFeatured: true,
    isNew: true,
    showOnHome: true,
    displayOrder: 7,
    category: { id: "cmvj6v8dy0008wk9clayozcmv", name: "Frozen Food", slug: "frozen-food" },
    images: [
      { url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "cmvj6v8mx001lwk9c5lwoq7nt",
    name: "Kastengel Keju Edam Asli",
    slug: "kastengel-keju-edam-asli",
    shortDescription: "Kue kering keju dengan taburan cheddar renyah dan adonan butter keju edam tua gurih.",
    description: "Kastengel premium bertekstur ngeprul dan renyah dengan keju edam asli.",
    price: 85000,
    promoPrice: null,
    unit: "toples",
    stock: 12,
    isAvailable: true,
    isBestSeller: false,
    isFeatured: true,
    isNew: false,
    showOnHome: true,
    displayOrder: 8,
    category: { id: "cmvj6v8df0006wk9cv2utl69q", name: "Kue Kering", slug: "kue-kering" },
    images: [
      { url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  },
  {
    id: "prod-paket-hemat-1",
    name: "Paket Hemat Combo Pastel & Risol Mayo (10 pcs)",
    slug: "paket-hemat-combo-pastel-risol-mayo-10-pcs",
    shortDescription: "Kombinasi 5 pcs Pastel Crispy ayam telur sayur dan 5 pcs Risol Mayo daging keju lumer.",
    description: "Pilihan paling hemat dan favorit untuk camilan bersama keluarga! Menghadirkan 5 pcs Pastel Renyah Berlapis dan 5 pcs Risol Mayo.",
    price: 52000,
    promoPrice: null,
    unit: "paket",
    stock: 25,
    isAvailable: true,
    isBestSeller: true,
    isFeatured: true,
    isNew: true,
    showOnHome: true,
    displayOrder: 9,
    category: { id: "cmvj6v8ec0009wk9cypljug9l", name: "Paket Hemat", slug: "paket-hemat" },
    images: [
      { url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80", isPrimary: true }
    ],
    variants: []
  }
];

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Pastel Renyah Berlapis",
    imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80",
    caption: "Pastel fresh baru matang dari wajan penggorengan dengan kulit pilin khas renyah.",
    categoryTag: "Pastel",
    altText: "Pastel goreng renyah isi ayam dan sayur"
  },
  {
    id: "gal-2",
    title: "Risol Mayo Creamy Lumer",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    caption: "Baluran tepung panir krispi berpadu isian mayones telur dan smoked beef lumer.",
    categoryTag: "Risol",
    altText: "Risol mayo keju lumer"
  },
  {
    id: "gal-3",
    title: "Sosis Solo Gurih Bungkus Telur",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80",
    caption: "Sosis solo digoreng berenda wangi rempah ketumbar dan santan gurih.",
    categoryTag: "Sosis Solo",
    altText: "Sosis solo goreng tradisional"
  },
  {
    id: "gal-4",
    title: "Kue Tradisional Pandan Segar",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    caption: "Wangi alami sari daun pandan asli tanpa pewarna sintetis.",
    categoryTag: "Kue Basah",
    altText: "Kue tradisional pandan legit"
  },
  {
    id: "gal-5",
    title: "Fudgy Brownies Shiny Crust",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    caption: "Potongan brownies tebal dengan lapisan atas mengkilap dan lelehan cokelat pekat.",
    categoryTag: "Brownies",
    altText: "Brownies panggang dark chocolate"
  },
  {
    id: "gal-6",
    title: "Persiapan Snack Box Acara Rapat",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    caption: "Penataan rapi dan higienis kotak kue siap antar untuk acara seminar instansi.",
    categoryTag: "Snack Box",
    altText: "Penyusunan snack box rapat higienis"
  },
  {
    id: "gal-7",
    title: "Paket Hemat Camilan Kumpul Keluarga",
    imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=80",
    caption: "Sajian lengkap aneka kue hangat gurih dan manis untuk momen kebersamaan.",
    categoryTag: "Paket Hemat",
    altText: "Paket kue keluarga Dapur Rasa"
  },
  {
    id: "gal-8",
    title: "Kastengel Keju Edam Gurih Ngeprul",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80",
    caption: "Kue kering klasik berbahan keju tua autentik dan mentega butter pilihan.",
    categoryTag: "Kue Kering",
    altText: "Toples kastengel keju edam"
  }
];

# 🍰 Dapur Rasa — Website E-Commerce Kue Rumahan Full-Stack dengan Dashboard Admin CMS

Platform website toko online kue dan camilan rumahan profesional, modern, responsif, dan lengkap dengan sistem keranjang persisten, alur pemesanan checkout terstruktur via WhatsApp, serta **Visual Admin CMS** untuk mengelola produk, galeri, harga, stok, konten homepage, header, footer, dan warna tema tanpa perlu menyentuh kode program.

---

## 1. Stack Teknologi

- **Frontend & Backend**: Next.js 16 (App Router, Server Actions & Route Handlers)
- **Bahasa Pemrograman**: TypeScript
- **Styling & Desain**: Tailwind CSS 4 dengan Dynamic CSS Variables
- **Database & ORM**: Prisma ORM dengan SQLite (zero-config, persisten di lokal, siap dialihkan ke PostgreSQL untuk deployment produksi)
- **Autentikasi & Otorisasi**: Server-side JWT (HTTP-Only Secure Cookie) & Password Hashing dengan `bcryptjs`
- **Ikonografi**: `lucide-react` & Custom Crisp SVG Social Icons
- **Penyimpanan Foto**: Persistent Uploads di `/public/uploads/` dengan validasi MIME & batas ukuran file 5MB, serta dukungan foto eksternal CDN/Unsplash.

---

## 2. Struktur Proyek

```text
dapur-rasa/
├── prisma/
│   ├── dev.db                      # Database SQLite lokal yang persisten
│   └── schema.prisma               # Definisi model data relasional Prisma
├── public/
│   └── uploads/                    # Folder penyimpanan file foto yang diunggah
├── scripts/
│   ├── seed.mjs                    # Script seeding data demo & inisialisasi awal
│   └── test-e2e.mjs                # Test suite pengujian otomatis end-to-end
├── src/
│   ├── app/
│   │   ├── admin/                  # Dashboard Admin CMS (/admin)
│   │   │   ├── categories/         # CRUD Kategori kue
│   │   │   ├── gallery/            # CRUD Galeri foto produk
│   │   │   ├── homepage/           # Visual Homepage Builder CMS
│   │   │   ├── login/              # Halaman login otentikasi admin
│   │   │   ├── navigation/         # Pengaturan Header, Footer & Identitas Brand
│   │   │   ├── orders/             # Manajemen pesanan masuk & chat WA pelanggan
│   │   │   ├── products/           # CRUD Produk, varian, dan foto
│   │   │   ├── settings/           # Pengaturan nomor WhatsApp, ongkir & warna tema
│   │   │   ├── stock/              # Manajemen stok, threshold minim & riwayat mutasi
│   │   │   ├── testimonials-faq/   # Manajemen ulasan & tanya jawab
│   │   │   ├── layout.tsx          # Layout admin dengan sidebar & proteksi sesi
│   │   │   └── page.tsx            # Overview metrik & pesanan terbaru
│   │   ├── api/
│   │   │   ├── admin/              # Endpoint API admin (dilindungi server auth)
│   │   │   ├── auth/               # Endpoint login, logout, dan status sesi
│   │   │   ├── orders/             # Endpoint pembuatan pesanan & link WA
│   │   │   ├── public/             # Endpoint publik (bootstrap, produk, galeri, dll)
│   │   │   └── upload/             # Handler upload file foto dengan validasi
│   │   ├── checkout/               # Halaman form checkout pesanan WhatsApp
│   │   ├── galeri/                 # Halaman galeri foto interaktif dengan Lightbox
│   │   ├── kebijakan/              # Halaman kebijakan pemesanan, privasi & komplain
│   │   ├── kontak/                 # Halaman kontak, jam buka & alamat dapur
│   │   ├── produk/                 # Halaman katalog kue & filter
│   │   │   └── [slug]/             # Halaman detail produk lengkap
│   │   ├── tentang-kami/           # Halaman cerita usaha & nilai brand
│   │   ├── testimoni/              # Halaman testimoni & ulasan pelanggan
│   │   ├── layout.tsx              # Root layout pelanggan
│   │   ├── page.tsx                # Homepage utama dengan 11 section modular
│   │   └── globals.css             # Desain sistem & variabel CSS tema dinamis
│   ├── components/
│   │   ├── CartDrawer.tsx          # Flyout keranjang belanja interaktif
│   │   ├── Footer.tsx              # Footer lengkap dapat dikelola dari CMS
│   │   ├── Navbar.tsx              # Header & Announcement bar dinamis
│   │   └── SocialIcons.tsx         # Ikon SVG sosial media (Instagram, Facebook, TikTok)
│   ├── context/
│   │   ├── CartContext.tsx         # State keranjang belanja persisten (localStorage)
│   │   └── StoreContext.tsx        # State toko & tema dinamis dari database
│   └── lib/
│       ├── auth.ts                 # Helper enkripsi password & token JWT
│       └── prisma.ts               # Singleton koneksi database Prisma
├── package.json
└── tsconfig.json
```

---

## 3. Fitur yang Telah Selesai Diimplementasikan

### A. Pengalaman Pelanggan (Customer Frontend)
1. **Homepage Dinamis & Premium**:
   - Announcement bar promo di bagian atas (bisa diaktifkan/dinonaktifkan dan diedit).
   - Hero banner dengan foto makanan realistis, headline, subheadline, tombol belanja, dan badge kualitas.
   - Grid kategori kue (Pastel, Risol, Sosis Solo, Bolu, Snack Box, Frozen Food, dll).
   - Grid menu Best Seller dan Promo diskon.
   - Banner promosi khusus paket snack box acara.
   - Bagian komitmen kualitas & kebersihan dapur (Value Props).
   - Cuplikan cerita usaha (Tentang Kami).
   - Cuplikan galeri foto langsung dari dapur.
   - Ulasan testimoni pelanggan.
   - Tanya-jawab operasional toko (FAQ interaktif).
   - Call to Action (CTA) pemesanan langsung WhatsApp.
2. **Katalog & Filter Produk (`/produk`)**:
   - Pencarian real-time berdasarkan nama produk atau deskripsi.
   - Filter cepat berdasarkan kategori kue.
   - Filter ketersediaan (hanya tampilkan produk yang stoknya tersedia).
   - Pengurutan harga (terendah, tertinggi, terbaru, nama A-Z).
   - Kartu produk konsisten dengan badge (Best Seller, Promo, Baru), harga normal & promo, serta status stok.
3. **Detail Produk Lengkap (`/produk/[slug]`)**:
   - Galeri multi-foto dengan selector thumbnail.
   - Selector varian (misal: rasa pedas, topping keju/almond, kemasan mika) dengan kalkulasi harga otomatis.
   - Selector jumlah pesanan dengan validasi batas stok maksimum.
   - Rincian bahan alami (komposisi), informasi alergen, petunjuk penyimpanan, masa simpan, dan berat/isi per kemasan.
   - Tombol **"Tambah ke Keranjang"** dan **"Pesan Langsung via WhatsApp"**.
   - Rekomendasi kue terkait dalam kategori yang sama.
4. **Halaman Galeri Foto Interaktif (`/galeri`)**:
   - Grid foto berkualitas tinggi dengan filter kategori tag.
   - **Interactive Lightbox Modal**: Klik foto untuk melihat ukuran besar, navigasi sebelumnya/berikutnya, caption foto, dan tombol tautan ke produk terkait jika ada.
5. **Halaman Informasi Lengkap**:
   - Tentang Kami (`/tentang-kami`)
   - Testimoni Pelanggan (`/testimoni`)
   - Kontak & Jam Operasional (`/kontak`)
   - Kebijakan Pemesanan, Pembatalan, dan Privasi (`/kebijakan`)
6. **Keranjang Belanja Persisten**:
   - Tersimpan di `localStorage` perangkat pengguna sehingga tidak hilang saat browser di-refresh.
   - Flyout drawer interaktif untuk menambah, mengurangi, atau menghapus item pesanan.
7. **Sistem Pemesanan Checkout WhatsApp**:
   - Form data pemesan (Nama, Nomor WhatsApp, Metode: Ambil di Toko / Pengiriman).
   - Input alamat pengiriman jika memilih opsi kirim.
   - Pilihan tanggal dan estimasi jam pengantaran pesanan.
   - Catatan khusus pelanggan.
   - **Revalidasi server-side**: Memastikan harga dan ketersediaan stok produk divalidasi ulang dari database sebelum pesanan dibuat.
   - Menyimpan transaksi ke tabel `Order` dengan **Kode Referensi Unik** (`DR-YYYYMMDD-XXXX`).
   - Otomatis menghasilkan tautan WhatsApp resmi (`https://wa.me/...`) dengan pesan terstruktur yang sudah di-URL-encode rapi.
   - Layar konfirmasi pesanan dengan status transparan: *"Menunggu Konfirmasi Penjual"*.

---

### B. Dashboard Admin CMS (`/admin`)
1. **Keamanan & Autentikasi**:
   - Sesi terproteksi di server menggunakan JWT dalam cookie HTTP-Only.
   - Password terenkripsi menggunakan algoritma `bcrypt`.
   - Pemeriksaan otorisasi server-side pada seluruh endpoint API `/api/admin/*`.
   - Kredensial development lokal awal: `admin` / `admin123`.
2. **Ringkasan Operasional (Overview)**:
   - Metrik total produk, produk aktif, produk habis stok.
   - Jumlah foto galeri dan kategori.
   - Jumlah pesanan berdasarkan status.
   - Kalkulasi pendapatan riil hanya dari transaksi yang telah dikonfirmasi atau diselesaikan.
   - Tabel pesanan terbaru dengan tombol pintas kelola.
3. **Manajemen Produk (CRUD Lengkap)**:
   - Tambah, edit, hapus, dan arsipkan produk.
   - Pengaturan nama, slug unik, deskripsi singkat & lengkap, SKU, satuan (pcs/box/pack/toples).
   - Pengaturan harga normal & harga promo (validasi promo < harga normal).
   - Pengaturan stok dan batas peringatan stok menipis (min stock alert).
   - Upload banyak foto produk sekaligus atau menggunakan URL eksternal.
   - Penambahan varian produk dengan penyesuaian harga (+/- Rp).
   - Form komposisi bahan, alergen, petunjuk penyimpanan, masa simpan, dan berat gram.
   - Label Best Seller, Produk Baru, dan tampil di homepage.
4. **Manajemen Kategori**:
   - Tambah, edit nama, slug, foto, dan urutan kategori.
   - Proteksi penghapusan kategori: Mencegah kategori terhapus jika masih memiliki produk aktif.
5. **Manajemen Galeri Foto**:
   - Upload foto baru dengan preview langsung.
   - Pengaturan judul, caption, tag kategori, dan penautan ke produk terkait.
   - Pengaturan status terbit (Tayang / Draft) dan urutan tampilan.
6. **Visual Homepage Builder**:
   - Menu khusus untuk mengubah tampilan homepage tanpa mengedit kode.
   - Mengaktifkan atau menonaktifkan section mana pun (Hero, Announcement, Promo Banner, Tentang Kami, FAQ, Testimoni, CTA).
   - Mengubah teks judul, subtitle, tombol, dan gambar banner.
   - Pengaturan urutan section.
7. **Manajemen Header & Footer**:
   - Penggantian nama brand dan tagline.
   - Penggantian logo toko.
   - Pengaturan tautan media sosial (Instagram, Facebook, TikTok).
   - Pengaturan alamat fisik dan jam operasional.
8. **Manajemen Pesanan**:
   - Tabel pesanan dengan filter status: *Menunggu Konfirmasi*, *Dikonfirmasi*, *Sedang Diproses*, *Siap Diambil/Dikirim*, *Selesai*, *Dibatalkan*.
   - Filter status pembayaran: *Belum Diverifikasi*, *Lunas*, *DP*.
   - Modal detail pesanan menampilkan rincian kue, alamat, jadwal, dan catatan pemesan.
   - Opsi otomatis kurangi stok kue saat pesanan dikonfirmasi oleh admin.
   - Tombol langsung untuk **chat WhatsApp ke nomor pelanggan** dengan pesan konfirmasi yang sudah otomatis terisi.
9. **Manajemen Stok & Inventaris**:
   - Tabel inventaris seluruh kue dengan indikator peringatan stok menipis atau habis.
   - Modal penyesuaian stok manual dengan input alasan (Restock, Koreksi Fisik, Rusak).
   - Riwayat pencatatan mutasi stok (`StockLog`) yang terdokumentasi rapi.
10. **Manajemen Testimoni & FAQ**:
    - Kelola testimoni pembeli, rating bintang, dan persetujuan tampil di website.
    - Kelola tanya-jawab operasional toko (FAQ) berdasarkan kategori.
11. **Pengaturan Bisnis & Tema Desain**:
    - Pengaturan nomor WhatsApp toko dengan format internasional (`62...`).
    - Pengaturan tarif standar ongkos kirim dan batas minimum pemesanan.
    - **Color Palette Manager**: Kustomisasi warna utama (Cocoa Brown), sekunder (Caramel), latar belakang (Warm Cream), dan kartu (Ivory) dengan pratinjau langsung.

---

## 4. Cara Menjalankan Website Secara Lokal

### Prasyarat
- Node.js versi 18 atau yang lebih baru.
- npm.

### Langkah Instalasi
1. Buka terminal pada direktori proyek:
   ```bash
   cd C:\Users\Lenovo\dapur-rasa
   ```

2. Jalankan migrasi dan seeding data demo:
   ```bash
   npx prisma db push
   npm run seed
   ```

3. Jalankan server development:
   ```bash
   npm run dev
   ```

4. Akses website melalui browser:
   - **Frontend Pelanggan**: [http://localhost:3000](http://localhost:3000)
   - **Dashboard Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Halaman Login Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 5. Kredensial Admin & Keamanan

### Kredensial Awal (Development Lingkungan Lokal)
- **Username**: `admin`
- **Password**: `admin123`

> [!WARNING]
> Kredensial `admin` / `admin123` hanya ditujukan untuk pengujian lingkungan pengembangan lokal. Sebelum melakukan deployment ke lingkungan produksi, ubah password admin melalui database atau gunakan environment variable yang aman.

### Mengubah Password Admin
Jalankan script pembuatan password baru atau update melalui Prisma Studio:
```bash
npx prisma studio
```

---

## 6. Pengujian Otomatis (Test Suite)

Proyek ini telah dilengkapi dengan script pengujian otomatis end-to-end yang memverifikasi 20 skenario kritis:
- Verifikasi autentikasi & password hashing.
- Pembuatan dan pembaruan produk, harga, dan stok.
- Validasi integritas kategori dan galeri foto.
- Persistensi konfigurasi homepage builder & store settings.
- Alur checkout pembuatan nomor referensi unik pesanan.
- Validasi format tautan WhatsApp resmi click-to-chat.
- Pembaruan status pesanan dan audit log mutasi stok.

Jalankan pengujian kapan saja dengan perintah:
```bash
npm run test:e2e
# atau
node scripts/test-e2e.mjs
```

---

## 7. Panduan Deployment Produksi

### Environment Variables Wajib
Buat file `.env` pada server produksi dengan konfigurasi berikut:
```env
# Database URL (SQLite untuk VPS/single server, atau PostgreSQL untuk arsitektur serverless)
DATABASE_URL="file:./dev.db"

# Secret Key untuk Enkripsi Token JWT Admin
JWT_SECRET="ganti-dengan-string-acak-panjang-dan-rahasia-minimal-32-karakter"

# Environment
NODE_ENV="production"
```

### Langkah Build Produksi
```bash
npm run build
npm start
```
Aplikasi akan berjalan pada port 3000 dengan performa tinggi dan halaman statis teroptimasi.

---

## 8. Konfigurasi yang Wajib Diisi Pemilik Sebelum Peluncuran

Sebelum website dibuka untuk umum, pemilik usaha wajib masuk ke `/admin/settings` dan melengkapi:
1. **Nomor WhatsApp Toko**: Masukkan nomor WhatsApp aktif tempat menerima pesanan (format: `628xxxxxxxxxx`).
2. **Alamat Fisik Dapur**: Masukkan alamat jelas jika mengaktifkan opsi Ambil Sendiri (Pickup).
3. **Jam Operasional**: Tentukan hari dan jam operasional dapur serta pengantaran.
4. **Tarif Ongkir**: Tentukan estimasi tarif ongkir standar jika melayani pengiriman lokal.
5. **Ganti Password Admin**: Pastikan password default `admin123` sudah diganti dengan kata sandi yang kuat.

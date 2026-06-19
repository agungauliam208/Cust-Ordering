# Cafe 1994 QR Ordering Frontend

Proyek ini adalah prototipe website pemesanan menu Cafe 1994 berbasis QR. Semua halaman dibuat terpisah agar mudah diedit di VSCode.

## Struktur Folder

```text
cafe-1994-ordering/
├── index.html              # Input nomor meja setelah scan QR
├── menu.html               # Halaman menu utama dan kategori
├── detail.html             # Detail produk dan pilihan varian
├── cart.html               # Keranjang pesanan
├── checkout.html           # Pilih pembayaran tunai dan non tunai
├── payment.html            # Verifikasi pembayaran non tunai
├── success.html            # Kode pesanan setelah checkout
├── order.html              # Cek status pesanan
├── assets/
│   ├── css/
│   │   └── styles.css      # Semua style responsif
│   ├── js/
│   │   ├── data.js         # Data menu dan kategori
│   │   ├── app.js          # Fungsi umum, cart, order, storage
│   │   ├── index.js        # Logic input meja
│   │   ├── menu.js         # Logic menu dan filter
│   │   ├── detail.js       # Logic detail produk
│   │   ├── cart.js         # Logic keranjang
│   │   ├── checkout.js     # Logic checkout dan pilihan pembayaran
│   │   ├── payment.js      # Logic verifikasi pembayaran non tunai
│   │   ├── success.js      # Logic halaman berhasil
│   │   └── order.js        # Logic cek status pesanan
│   └── img/                # Gambar SVG produk lokal
└── README.md
```

## Cara Menjalankan

1. Buka folder `cafe-1994-ordering` di VSCode.
2. Jalankan memakai ekstensi Live Server.
3. Buka `index.html`.
4. Untuk simulasi QR meja, buka URL seperti ini:

```text
index.html?table=12
```

## Fitur yang Sudah Jalan

- Input nomor meja.
- Menu responsif untuk HP dan desktop.
- Kategori menu: Semua, Rekomendasi, Promo, Makanan, Coffee, Non Coffee, Cemilan, Dessert.
- Pencarian menu.
- Tambah menu langsung dari halaman menu.
- Halaman detail produk.
- Pilihan varian minuman: ukuran, suhu, gula, tambahan, catatan.
- Pilihan makanan: level pedas, porsi, tambahan, catatan.
- Pilihan cemilan, dessert, dan paket promo.
- Keranjang dengan tambah jumlah, kurang jumlah, hapus item, dan total harga.
- Checkout tunai dengan QR demo dan batas waktu 10 menit.
- Checkout non tunai dengan QRIS dan virtual account demo.
- Halaman verifikasi pembayaran non tunai sesuai metode yang dipilih.
- Tombol “Saya sudah bayar” untuk simulasi verifikasi pembayaran sebelum pesanan dibuat.
- Kode pesanan otomatis.
- Cek status pesanan memakai kode.
- Simulasi status pesanan berjalan berdasarkan waktu.
- Data tersimpan sementara memakai `localStorage` browser.

## Catatan Pengembangan Backend

Untuk produksi, hubungkan frontend ini dengan backend agar fitur berikut benar-benar aman dan akurat:

- QR meja memakai token unik per meja.
- Data menu berasal dari database.
- Pesanan tersimpan di server.
- Pembayaran QRIS dan virtual account terhubung ke payment gateway.
- Verifikasi kasir dilakukan dari dashboard admin.
- Status pesanan diubah oleh kasir, barista, atau dapur secara real time.
- Notifikasi pesanan masuk ke dashboard dapur.

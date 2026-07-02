# Tugas 2 Cloud Computing — Muhammad Azriel Wardana

Aplikasi: **Catatan Kegiatan Mengajar PLP - IPAS**

Aplikasi web CRUD sederhana untuk mencatat kegiatan/penilaian siswa selama praktik
mengajar (PLP) pada mata pelajaran IPAS. Dibangun dengan Node.js (Express + EJS)
dan MongoDB, dikemas dalam 2 container terpisah menggunakan Docker Compose.

## Arsitektur Container

| Service | Image / Base            | Fungsi                          | Port  |
|---------|--------------------------|----------------------------------|-------|
| `web`   | `node:20-alpine` (custom build) | Aplikasi Express (frontend + backend) | 3000  |
| `db`    | `mongo:7`                | Database MongoDB                | 27017 |

Kedua service terhubung lewat network bridge internal `plp_network`, dan data MongoDB
disimpan persisten lewat volume `mongo_data`.

## Cara Menjalankan

1. Pastikan Docker & Docker Compose sudah terpasang.
2. Clone repository ini, lalu masuk ke foldernya.
3. Jalankan:
   ```bash
   docker compose up --build
   ```
4. Buka browser ke: `http://localhost:3000`
5. Untuk menghentikan:
   ```bash
   docker compose down
   ```
   Tambahkan `-v` jika ingin menghapus juga data MongoDB (volume).

## Fitur Aplikasi

- Tambah catatan kegiatan siswa (nama, pertemuan ke-, materi, catatan/alasan, nilai)
- Lihat daftar seluruh catatan
- Edit catatan
- Hapus catatan
- Endpoint `/health` untuk mengecek status koneksi ke database

## Struktur Folder

```
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
└── app/
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── views/
    │   ├── index.ejs
    │   ├── tambah.ejs
    │   └── edit.ejs
    └── public/
        └── style.css
```

## Penjelasan Dockerfile

- Base image `node:20-alpine` dipilih karena ukurannya kecil dan ringan.
- `package.json` dicopy lebih dulu sebelum source code lain agar `npm install`
  bisa memanfaatkan layer cache Docker (build lebih cepat saat hanya source code
  yang berubah).
- Dependency diinstall dengan `--omit=dev` agar image production lebih ringkas.

## Penjelasan docker-compose.yml

- Service `web` di-build dari `Dockerfile` lokal dan terhubung ke service `db`
  lewat environment variable `MONGO_URI=mongodb://db:27017/catatan_plp`
  (nama service `db` otomatis bisa di-resolve sebagai hostname dalam network Compose).
- Service `db` menggunakan image resmi `mongo:7` dan datanya disimpan di volume
  `mongo_data` supaya tidak hilang saat container di-restart.
- `depends_on` memastikan container `db` dijalankan lebih dulu; aplikasi Express
  juga sudah dilengkapi retry logic saat koneksi awal ke MongoDB agar tidak crash
  jika `db` belum sepenuhnya siap.

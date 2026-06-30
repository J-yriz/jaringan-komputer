# PRD — Simple Inventory Management System (Next.js Edition)

## 1. Overview

**Nama Proyek:** Simple Inventory System

Aplikasi ini adalah sistem manajemen inventaris barang berbasis web yang dibangun menggunakan framework *Fullstack* **Next.js**. Tujuan utama proyek ini adalah menyediakan antarmuka yang sangat responsif dan fungsional untuk mengelola data barang (CRUD murni) secara aman melalui sistem autentikasi tertutup tunggal.

Masalah utama yang diselesaikan adalah digitalisasi pencatatan stok yang cepat dan terpusat. Dengan Next.js, aplikasi ini tidak hanya menawarkan UI yang interaktif, tetapi juga API internal yang tangguh untuk memproses data inventaris ke dalam database relasional.

## 2. Requirements

Berikut adalah spesifikasi utama untuk pengembangan sistem ini:

* **Autentikasi Terpusat (Single Admin):** Menggunakan **NextAuth.js** (Auth.js) dengan metode *Credentials Provider* (Email & Password). Hanya pengguna yang terautentikasi (Admin) yang dapat mengakses rute *dashboard* terlindungi.
* **Antarmuka Modern & Cepat:** Menggunakan **React / Next.js (App Router)** dipadukan dengan **Tailwind CSS**. Komponen bersifat modular dan responsif.
* **Fokus pada CRUD Murni:** Aplikasi difokuskan pada integritas data dasar (Create, Read, Update, Delete) tanpa fitur kompleks seperti upload file atau pagination lanjutan.
* **Database Relasional Type-Safe:** Interaksi ke database MariaDB dikelola melalui **Prisma ORM** untuk memastikan *type-safety* dan mempermudah migrasi skema.
* **Siap Deploy (VPS-ready):** Aplikasi akan di- *build* dan dijalankan di Node.js menggunakan *process manager* seperti PM2, dengan Nginx bertindak sebagai *Reverse Proxy*.

## 3. Core Features

Fitur-fitur inti dari aplikasi ini:

1. **Authentication (Admin Auth)**
* Halaman Login kustom.
* Proteksi halaman menggunakan *middleware* bawaan Next.js. Rute `/dashboard` dan `/api/items` hanya bisa diakses jika token sesi valid.


2. **Manajemen Inventaris (Modul CRUD `items`)**
* **Create:** Form penambahan barang baru (Nama Barang, Jumlah, Harga) menggunakan Next.js *Server Actions* atau API Routes.
* **Read:** Menampilkan data dari database secara *real-time* atau revalidasi pada halaman tabel.
* **Update:** *Modal* atau rute khusus untuk mengedit detail barang.
* **Delete:** Aksi cepat untuk menghapus barang dari sistem.



## 4. User Flow

**Alur Pengguna (Admin):**

1. Admin membuka domain/URL aplikasi.
2. Next.js Middleware mendeteksi ketiadaan sesi dan melakukan *redirect* ke halaman `/login`.
3. Admin memasukkan kredensial. NextAuth memvalidasi data ke database.
4. Admin masuk ke rute `/dashboard` (menampilkan tabel barang).
5. Admin menekan tombol "Tambah Barang" (membuka Form UI).
6. Saat disimpan, *Server Action* akan memicu Prisma untuk melakukan `prisma.item.create()`.
7. Tabel melakukan *refresh* otomatis (revalidasi rute).
8. Admin melakukan aksi Edit atau Hapus sesuai kebutuhan.
9. Admin melakukan *Logout* (sesi dihancurkan oleh NextAuth).

## 5. Architecture

Sistem ini menggunakan arsitektur bawaan Next.js App Router (React Server Components).

* **Frontend (UI):** Client Components & Server Components (di dalam `/app`). Menggunakan Tailwind CSS untuk penataan gaya (styling).
* **Backend (Logika & API):** Next.js Server Actions dan/atau Route Handlers (`/app/api/...`).
* **ORM Layer:** Prisma Client mengeksekusi *query* langsung ke database.
* **Database:** MariaDB berjalan secara terpisah di VPS yang sama.

## 6. Database Schema (Prisma)

Karena menggunakan Next.js, skema database tidak lagi ditulis dalam bentuk migrasi Laravel (PHP), melainkan dalam file `schema.prisma`. Provider yang digunakan untuk MariaDB tetap ditulis sebagai `mysql`.

**File: `prisma/schema.prisma**`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Item {
  id        Int      @id @default(autoincrement())
  name      String
  qty       Int      @default(0)
  price     Decimal  @db.Decimal(15, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

## 7. Tech Stack

* **Framework:** Next.js (App Router, React)
* **Bahasa:** TypeScript (Direkomendasikan) / JavaScript
* **Styling:** Tailwind CSS (bisa dikombinasikan dengan *shadcn/ui* jika butuh komponen instan)
* **Database:** MariaDB
* **ORM:** Prisma ORM
* **Autentikasi:** NextAuth.js (Auth.js) v5
* **Deployment Target:** VPS (Linux) menggunakan Node.js, PM2, dan Nginx (Reverse Proxy).
# Sistem Inventory

Aplikasi manajemen inventory sederhana berbasis Next.js, Prisma ORM, dan MariaDB.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** MariaDB 10+
- **ORM:** Prisma 7 with `@prisma/adapter-mariadb`
- **Auth:** NextAuth.js v5 (Credentials Provider)
- **Styling:** Tailwind CSS v4

---

## Prasyarat

- Node.js 24+
- MariaDB/MySQL database
- PM2 (process manager)
- Apache2 (web server / reverse proxy)

---

## 1. Clone Project

Clone project ke folder yang diinginkan. Disarankan di root folder untuk kemudahan:

```bash
# Cek lokasi sekarang
pwd

# Clone project (rekomendasi: /home/nama-root/inventory-server atau ~/nama-root/inventory-server)
git clone <repository-url>
cd /home/nama-root/inventory-server
```

> **Tips:** Gunakan `pwd` untuk memastikan kamu berada di folder yang benar.

---

## 2. Buat Database

Database sudah dibuat otomatis oleh Prisma. Yang perlu dilakukan adalah membuat database kosong di MariaDB:

```bash
# Login ke MariaDB
mysql -u root -p

# Buat database
CREATE DATABASE inventory_db;

# Keluar
EXIT;
```

---

## 3. Konfigurasi Environment

Buat file `.env` di folder project:

```bash
nano .env
```

Isi dengan:

```env
DATABASE_URL="mysql://user-disesuaikan:password@ipaddress:3306/inventory_db"
AUTH_SECRET="inventory-system-secret-key-2024-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

> **Catatan:** Ubah `password` sesuai dengan password root MariaDB kamu.

Generate AUTH_SECRET secara otomatis:

```bash
openssl rand -base64 32
```

---

## 4. Install Dependencies & Setup Database

```bash
# Install semua package
npm install

# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Jalankan seeder (membuat admin & data contoh)
npm run db:seed
```

**Login default setelah seeder:**
- **Email:** `admin@inventory.local`
- **Password:** `admin123`

---

## 5. Build Production

```bash
npm run build
```

---

## 6. Setup PM2 (Process Manager)

PM2 memastikan aplikasi tetap jalan di background dan auto-start saat server reboot.

### Install PM2

```bash
npm install -g pm2
```

### Buat ecosystem file

```bash
nano ecosystem.config.js
```

Isi dengan:

```js
module.exports = {
  apps: [
    {
      name: "inventory",
      script: "npm",
      args: "run start",
      cwd: "/home/nama-root/inventory-server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

> **Catatan:** Gunakan `npm run start` invece `node_modules/next/dist/bin/next start` agar environment variables dan CSS ter-load dengan benar. Ubah `cwd` sesuai dengan lokasi folder project kamu.

### Jalankan aplikasi

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # auto-start saat server reboot
```

### Perintah PM2 yang berguna

```bash
pm2 status           # lihat status aplikasi
pm2 logs inventory   # lihat log aplikasi
pm2 restart inventory # restart aplikasi
pm2 stop inventory   # stop aplikasi
```

---

## 7. Setup Apache2 (Reverse Proxy)

Apache2 akan meneruskan request dari port 80 ke aplikasi Next.js di port 3000.

### Aktifkan module yang diperlukan

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
```

### Buat file konfigurasi

```bash
sudo nano /etc/apache2/sites-available/inventory.conf
```

Isi dengan:

```apache
<VirtualHost *:80>
    ServerName localhost

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>
</VirtualHost>
```

### Aktifkan konfigurasi

```bash
# Nonaktifkan default site (optional)
sudo a2dissite 000-default.conf

# Aktifkan konfigurasi inventory
sudo a2ensite inventory.conf

# Test konfigurasi
sudo apache2ctl configtest

# Restart Apache2
sudo systemctl restart apache2
```

---

## 8. Akses Aplikasi

Buka browser dan akses:

```
http://localhost
```

Atau jika dari komputer lain:

```
http://192.168.x.x
```

Ganti `192.168.x.x` dengan IP address server.

**Login:**
- **Email:** `admin@inventory.local`
- **Password:** `admin123`

---

## Troubleshooting

### Error: pool timeout / Access denied
Pastikan `DATABASE_URL` di file `.env` sudah benar dengan password root MariaDB kamu.

### Error: Prisma Client not found
Jalankan ulang:
```bash
npm run db:generate
```

### Apache2 502 Bad Gateway
Pastikan PM2 sudah running:
```bash
pm2 status
curl http://127.0.0.1:3000
```

### PM2 tidak auto-start saat reboot
```bash
pm2 startup
pm2 save
```

### Aplikasi tidak bisa diakses
Cek firewall:
```bash
sudo ufw allow 80
sudo ufw allow 3000
```

### Cek IP Address Server
```bash
ip addr show | grep inet
# atau
hostname -I
```

---

## Available Scripts

```bash
# Development
npm run dev          # Jalankan development server

# Production
npm run build        # Build untuk production
npm run start        # Jalankan server production

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema ke database
npm run db:seed      # Jalankan seeder
npm run db:studio    # Buka Prisma Studio

# Lainnya
npm run lint         # ESLint
```

---

## Struktur Folder

```
.
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth, items)
│   ├── dashboard/         # Halaman dashboard (terproteksi)
│   └── login/             # Halaman login
├── app/actions/           # Server Actions (CRUD)
├── app/generated/prisma/  # Generated Prisma Client
├── lib/
│   └── db.ts              # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Schema database
│   └── seed.ts            # Script seeder
├── auth.ts                # Konfigurasi NextAuth
└── proxy.ts               # Middleware (proteksi auth)
```

---

## Catatan untuk Tugas Praktikum

Karena ini menggunakan VM tanpa domain:
- Tidak perlu setup SSL (Certbot tidak diperlukan)
- `NEXTAUTH_URL` gunakan IP address atau `localhost`
- Pastikan semua VM terhubung di jaringan yang sama (NAT atau Bridged Adapter)
- Untuk demo, gunakan credentials default: `admin@inventory.local` / `admin123`

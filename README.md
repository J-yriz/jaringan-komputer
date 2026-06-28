# Inventory System

Simple inventory management system built with Next.js, Prisma ORM, and MariaDB.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** MariaDB 10+
- **ORM:** Prisma 7 with `@prisma/adapter-mariadb`
- **Auth:** NextAuth.js v5 (Credentials Provider)
- **Styling:** Tailwind CSS v4

---

## Prasyarat

- Node.js 20+
- MariaDB/MySQL database
- PM2 (process manager)
- Nginx (reverse proxy)

---

## 1. Setup Database (VM Server)

### Buat database dan user

```bash
# Login ke MariaDB
mysql -u root -p

# Buat database
CREATE DATABASE inventory_db;

# Buat user
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'inventory123';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
```

### Atau via Docker

```bash
docker run -d \
  --name inventory-mariadb \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=inventory_db \
  -e MYSQL_USER=inventory_user \
  -e MYSQL_PASSWORD=inventory123 \
  -p 3306:3306 \
  mariadb:latest
```

---

## 2. Setup Project di VM Server

### Transfer project ke VPS

```bash
# Copy project ke VM server
scp -r ./inventory-server user@192.168.x.x:/var/www/inventory
# Atau clone dari Git repo jika ada
```

### Install dependencies

```bash
cd /var/www/inventory
npm install
```

### Setup environment variables

Buat file `.env`:

```env
DATABASE_URL="mysql://inventory_user:inventory123@localhost:3306/inventory_db"
AUTH_SECRET="inventory-system-secret-key-2024-change-this"
NEXTAUTH_URL="http://192.168.x.x:3000"
```

Generate AUTH_SECRET:

```bash
openssl rand -base64 32
```

### Generate Prisma Client

```bash
npm run db:generate
```

### Push schema ke database

```bash
npm run db:push
```

### Jalankan seeder (buat admin & sample data)

```bash
npm run db:seed
```

Default credentials setelah seeder:
- **Email:** `admin@inventory.local`
- **Password:** `admin123`

---

## 3. Build Production

```bash
npm run build
```

---

## 4. Setup PM2

### Install PM2 globally

```bash
npm install -g pm2
```

### Buat ecosystem file

```bash
nano ecosystem.config.js
```

```js
module.exports = {
  apps: [
    {
      name: "inventory",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/inventory",
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

### Start aplikasi

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # auto-start saat VPS reboot
```

### Useful PM2 commands

```bash
pm2 status           # lihat status
pm2 logs inventory   # lihat log
pm2 restart inventory # restart
pm2 stop inventory   # stop
```

---

## 5. Setup Nginx (Reverse Proxy)

```bash
nano /etc/nginx/sites-available/inventory
```

```nginx
server {
    listen 80;
    server_name 192.168.x.x;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktifkan site
ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/

# Hapus default site (optional)
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## 6. Akses dari VM Client

Dari VM client, buka browser dan akses:

```
http://192.168.x.x:3000
```

Ganti `192.168.x.x` dengan IP address VM server.

Jika tidak bisa diakses, cek firewall:

```bash
# Di VM Server
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 3306  # hanya jika client perlu akses DB langsung
```

---

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:seed      # Run database seeder
npm run db:studio    # Buka Prisma Studio
```

---

## Struktur Folder

```
.
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth, items)
│   ├── dashboard/         # Protected dashboard pages
│   └── login/             # Login page
├── app/actions/           # Server Actions (CRUD)
├── app/generated/prisma/  # Generated Prisma Client
├── lib/
│   └── db.ts              # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seeder script
├── auth.ts                # NextAuth configuration
└── proxy.ts               # Middleware (auth protection)
```

---

## API Endpoints

| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | `/api/items`                  | List all items       |
| POST   | `/api/items`                  | Create new item      |
| GET    | `/api/items/[id]`             | Get single item      |
| PUT    | `/api/items/[id]`             | Update item          |
| DELETE | `/api/items/[id]`             | Delete item          |
| POST   | `/api/auth/[...nextauth]`     | NextAuth handlers    |

---

## Troubleshooting

### Error: pool timeout / Access denied
Pastikan `DATABASE_URL` di `.env` sesuai dengan user dan password MariaDB yang sudah dibuat.

### Error: Prisma Client not found
Jalankan `npm run db:generate` untuk meregenerate Prisma Client.

### PM2 tidak auto-start saat reboot
```bash
pm2 startup   # lalu ikuti instruksi yang muncul
pm2 save
```

### Nginx 502 Bad Gateway
Pastikan PM2 sudah running dan aplikasi listen di port yang benar:
```bash
pm2 status
curl http://127.0.0.1:3000
```

### VM Client tidak bisa akses server
- Pastikan firewall server mengizinkan port 3000 dan 80
- Pastikan VM client dan server ada di jaringan yang sama
- Cek IP address server: `ip addr show` atau `hostname -I`

### Cek IP Address Server
```bash
ip addr show | grep inet
# atau
hostname -I
```

Akan keluar IP seperti `192.168.x.x` — gunakan IP ini di VM client.

---

## Catatan untuk Tugas Praktikum

Karena ini menggunakan VM tanpa domain:
- Tidak perlu setup SSL (Certbot tidak diperlukan)
- `NEXTAUTH_URL` gunakan IP address, bukan domain
- Pastikan semua VM terhubung di jaringan yang sama (NAT atau Bridged Adapter)
- Untuk demo, credentials default sudah cukup: `admin@inventory.local` / `admin123`
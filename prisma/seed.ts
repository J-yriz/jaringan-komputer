import "dotenv/config"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { hash } from "bcryptjs"

async function main() {
  // Parse connection string manually
  const url = new URL(process.env.DATABASE_URL!)

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  })

  const db = new PrismaClient({ adapter })

  console.log("Seeding database...")

  const adminEmail = "admin@inventory.local"
  const existingUser = await db.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingUser) {
    const hashedPassword = await hash("admin123", 12)
    await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
      },
    })
    console.log("Admin user created: admin@inventory.local / admin123")
  } else {
    console.log("Admin user already exists")
  }

  const itemCount = await db.item.count()
  if (itemCount === 0) {
    await db.item.createMany({
      data: [
        { name: "Laptop ASUS ROG", qty: 5, price: "15000000" },
        { name: "Mouse Logitech G502", qty: 20, price: "850000" },
        { name: "Keyboard Mechanical", qty: 15, price: "2500000" },
        { name: "Monitor 27 inch", qty: 8, price: "4500000" },
        { name: "Headset SteelSeries", qty: 12, price: "1800000" },
      ],
    })
    console.log("Sample items created")
  } else {
    console.log("Items already exist, skipping")
  }

  console.log("Seeding completed!")
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
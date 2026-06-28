import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await db.item.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, qty, price } = body

    if (!name || qty === undefined || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const item = await db.item.create({
      data: {
        name,
        qty: parseInt(qty),
        price,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}

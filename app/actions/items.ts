"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createItem(formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const qty = parseInt(formData.get("qty") as string)
  const price = formData.get("price") as string

  if (!name || isNaN(qty) || !price) {
    return { error: "Semua field harus diisi dengan benar" }
  }

  try {
    await db.item.create({
      data: {
        name,
        qty,
        price: price,
      },
    })
  } catch (error) {
    return { error: "Gagal menambahkan barang" }
  }

  revalidatePath("/dashboard")
}

export async function updateItem(formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const id = parseInt(formData.get("id") as string)
  const name = formData.get("name") as string
  const qty = parseInt(formData.get("qty") as string)
  const price = formData.get("price") as string

  if (!id || !name || isNaN(qty) || !price) {
    return { error: "Semua field harus diisi dengan benar" }
  }

  try {
    await db.item.update({
      where: { id },
      data: {
        name,
        qty,
        price,
      },
    })
  } catch (error) {
    return { error: "Gagal memperbarui barang" }
  }

  revalidatePath("/dashboard")
}

export async function deleteItem(id: number) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  try {
    await db.item.delete({
      where: { id },
    })
  } catch (error) {
    return { error: "Gagal menghapus barang" }
  }

  revalidatePath("/dashboard")
}

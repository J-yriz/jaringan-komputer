"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Item {
  id: number
  name: string
  qty: number
  price: string
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState<Item | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/items/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Gagal memuat data barang.")
        setLoading(false)
      })
  }, [params.id])

  async function handleSubmit(formData: FormData) {
    if (!item) return

    const name = formData.get("name") as string
    const qty = formData.get("qty") as string
    const price = formData.get("price") as string

    if (!name || !qty || !price) {
      setError("Semua field wajib diisi")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, qty: parseInt(qty), price }),
      })

      if (!res.ok) throw new Error("Gagal menyimpan")

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Terjadi kesalahan saat menyimpan. Coba lagi.")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">Memuat data barang...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Barang tidak ditemukan. <Link href="/dashboard" className="form-back">Kembali</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <header className="form-header">
        <Link href="/dashboard" className="form-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Kembali
        </Link>
        <span style={{color: "var(--color-border-strong)"}}>·</span>
        <span className="form-header-title">Edit Barang</span>
      </header>

      <div className="form-body">
        <div className="form-card">
          <div className="form-section-title">Detail Barang — ID #{item.id}</div>

          <form action={handleSubmit}>
            {error && (
              <div className="alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="name">Nama Barang</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={item.name}
                className="input"
              />
            </div>

            <div className="field">
              <label htmlFor="qty">
                Stok / Jumlah
                <span className="field-hint">(unit)</span>
              </label>
              <input
                type="number"
                id="qty"
                name="qty"
                required
                min="0"
                defaultValue={item.qty}
                className="input mono"
              />
            </div>

            <div className="field">
              <label htmlFor="price">
                Harga Satuan
                <span className="field-hint">(Rp)</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="1"
                defaultValue={item.price}
                className="input mono"
              />
            </div>

            <div className="form-actions">
              <Link href="/dashboard" className="btn-secondary">
                Batal
              </Link>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

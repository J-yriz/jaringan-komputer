"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewItemPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [qtyDisplay, setQtyDisplay] = useState("")
  const [priceDisplay, setPriceDisplay] = useState("")

  function formatDots(v: string) {
    return v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string
    const qty = qtyDisplay.replace(/\./g, "")
    const price = priceDisplay.replace(/\./g, "")

    if (!name || !qty || !price) {
      setError("Semua field wajib diisi")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, qty: parseInt(qty), price }),
      })

      if (!res.ok) throw new Error("Gagal menyimpan")

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Terjadi kesalahan saat menyimpan. Coba lagi.")
      setLoading(false)
    }
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
        <span className="form-header-title">Tambah Barang Baru</span>
      </header>

      <div className="form-body">
        <div className="form-card">
          <div className="form-section-title">Detail Barang</div>

          <form action={handleSubmit}>
            {error && (
              <div className="alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="name">
                Nama Barang
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input"
                placeholder="cth. Laptop ASUS ROG"
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="qty">
                Stok / Jumlah
                <span className="field-hint">(unit)</span>
              </label>
              <input
                type="text"
                id="qty"
                name="qty"
                required
                inputMode="numeric"
                className="input mono"
                placeholder="0"
                value={qtyDisplay}
                onInput={e => setQtyDisplay(formatDots(e.currentTarget.value))}
              />
            </div>

            <div className="field">
              <label htmlFor="price">
                Harga Satuan
                <span className="field-hint">(Rp)</span>
              </label>
              <input
                type="text"
                id="price"
                name="price"
                required
                inputMode="numeric"
                className="input mono"
                placeholder="0"
                value={priceDisplay}
                onInput={e => setPriceDisplay(formatDots(e.currentTarget.value))}
              />
            </div>

            <div className="form-actions">
              <Link href="/dashboard" className="btn-secondary">
                Batal
              </Link>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Barang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

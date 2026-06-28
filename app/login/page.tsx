"use client"

import { useState } from "react"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      {/* Left: Brand panel */}
      <aside className="login-brand-panel">
        <div className="login-brand-top">
          <div className="login-brand-icon">📦</div>
          <h1 className="login-brand-headline">
            Kelola stok<br />dengan cepat.
          </h1>
          <p className="login-brand-desc">
            Sistem inventaris terpusat untuk satu admin. Catat, ubah, dan hapus barang dalam hitungan detik.
          </p>
        </div>

        <ul className="login-feature-list">
          <li className="login-feature-item">
            <span className="login-feature-dot" />
            CRUD barang — nama, stok, harga
          </li>
          <li className="login-feature-item">
            <span className="login-feature-dot" />
            Data real-time dari database
          </li>
        </ul>
      </aside>

      {/* Right: Form panel */}
      <main className="login-form-panel">
        <div className="login-form-inner">
          <p className="login-form-eyebrow">Admin Portal</p>
          <h2 className="login-form-title">Selamat datang</h2>
          <p className="login-form-sub">Masukkan kredensial untuk melanjutkan ke dashboard.</p>

          <form action={handleSubmit}>
            {error && (
              <div className="alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">default credentials</span>
            <span className="login-divider-line" />
          </div>

          <div className="login-credential-hint">
            <strong>Email:</strong> admin@inventory.local<br />
            <strong>Password:</strong> admin123
          </div>
        </div>
      </main>
    </div>
  )
}

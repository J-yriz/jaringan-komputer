import { auth, signOut } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { deleteItem } from "@/app/actions/items"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const items = await db.item.findMany({ orderBy: { createdAt: "desc" } })

  const totalItems = items.length
  const totalStock = items.reduce((sum, i) => sum + i.qty, 0)
  const totalValue = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0)

  const userInitial = (session.user?.email ?? "A")[0].toUpperCase()

  function qtyClass(qty: number) {
    if (qty === 0) return "low"
    if (qty <= 5) return "warn"
    return "ok"
  }

  async function handleSignOut() {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <div className="brand-icon">📦</div>
            <div>
              <div className="brand-name">Inventory</div>
              <div className="brand-sub">System</div>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <a href="/dashboard" className="sidebar-nav-item active">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z"/>
            </svg>
            Daftar Barang
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-email">{session.user?.email}</div>
              <form action={handleSignOut}>
                <button type="submit" className="btn-logout">Logout →</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="main-content">
        <header className="page-header">
          <div>
            <div className="page-title">Daftar Barang</div>
            <div className="page-subtitle">Kelola data inventaris barang Anda</div>
          </div>
          <Link href="/dashboard/new" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Tambah Barang
          </Link>
        </header>

        <div className="page-body">
          {/* Stat cards */}
          <div className="stat-grid">
            <div className="stat-card blue">
              <div className="stat-label">Total Jenis Barang</div>
              <div className="stat-value">{totalItems}</div>
              <div className="stat-desc">jenis barang tercatat</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Total Stok</div>
              <div className="stat-value">{totalStock.toLocaleString("id-ID")}</div>
              <div className="stat-desc">unit di semua barang</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-label">Nilai Total Inventaris</div>
              <div className="stat-value mono">
                Rp {totalValue.toLocaleString("id-ID")}
              </div>
              <div className="stat-desc">harga × stok semua barang</div>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <div className="table-toolbar">
              <div>
                <div className="table-toolbar-title">Semua Barang</div>
                <div className="table-toolbar-count">{totalItems} barang ditemukan</div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">Belum ada barang</div>
                <div className="empty-state-desc">Mulai dengan menambahkan barang pertama ke inventaris.</div>
                <Link href="/dashboard/new" className="btn-primary" style={{display: "inline-flex"}}>
                  Tambah Barang Pertama
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{width: 48}}>#</th>
                    <th>Nama Barang</th>
                    <th style={{width: 120}}>Stok</th>
                    <th style={{width: 200}}>Harga Satuan</th>
                    <th style={{width: 200}}>Nilai Stok</th>
                    <th style={{width: 140}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td><span className="row-index">{index + 1}</span></td>
                      <td><span className="td-name">{item.name}</span></td>
                      <td>
                        <span className={`badge-qty ${qtyClass(item.qty)}`}>
                          {item.qty}
                        </span>
                      </td>
                      <td>
                        <span className="td-price">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td>
                        <span className="td-price" style={{color: "var(--color-ink-muted)", fontWeight: 500}}>
                          Rp {(Number(item.price) * item.qty).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td>
                        <div className="action-group">
                          <Link href={`/dashboard/edit/${item.id}`} className="btn-edit">
                            Edit
                          </Link>
                          <form action={async () => {
                            "use server"
                            await deleteItem(item.id)
                          }}>
                            <button type="submit" className="btn-delete">
                              Hapus
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

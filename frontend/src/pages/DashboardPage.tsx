import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, DashboardSummary } from "../types";

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<ApiResponse<DashboardSummary>>("/dashboard/summary")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading dashboard…</div>;
  if (error) return <div className="page alert error">{error}</div>;
  if (!data) return <div className="page">No dashboard data</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>Welcome, {user?.name}</h1>
          <p className="muted">Role: {user?.role}</p>
        </div>
      </header>

      <section className="stat-grid">
        <article className="stat">
          <span>Customers</span>
          <strong>{data.totalCustomers}</strong>
        </article>
        <article className="stat">
          <span>Products</span>
          <strong>{data.totalProducts}</strong>
        </article>
        <article className="stat warn">
          <span>Low stock</span>
          <strong>{data.lowStockProducts}</strong>
        </article>
        <article className="stat">
          <span>Challans</span>
          <strong>{data.totalChallans}</strong>
        </article>
        <article className="stat">
          <span>Draft</span>
          <strong>{data.draftChallans}</strong>
        </article>
        <article className="stat">
          <span>Confirmed</span>
          <strong>{data.confirmedChallans}</strong>
        </article>
      </section>

      <section className="quick-links">
        {hasRole("ADMIN", "SALES") && (
          <Link className="quick-link" to="/customers/new">
            Add customer
          </Link>
        )}
        {hasRole("ADMIN", "WAREHOUSE") && (
          <Link className="quick-link" to="/products/new">
            Add product
          </Link>
        )}
        {hasRole("ADMIN", "SALES") && (
          <Link className="quick-link" to="/challans/new">
            Create sales challan
          </Link>
        )}
      </section>

      <section className="detail-grid" style={{ marginTop: "1.25rem" }}>
        <div>
          <h3>Low stock items</h3>
          <ul className="timeline">
            {data.lowStockItems.map((p) => (
              <li key={p.id}>
                <strong>
                  <Link to={`/products/${p.id}`}>{p.productName}</Link>
                </strong>
                <span>
                  {p.sku} · stock {p.currentStock} / min {p.minimumStockAlertQuantity}
                </span>
              </li>
            ))}
            {!data.lowStockItems.length && <li className="empty">No low stock items</li>}
          </ul>
        </div>
        <div>
          <h3>Recent challans</h3>
          <ul className="timeline">
            {data.recentChallans.map((c) => (
              <li key={c.id}>
                <strong>
                  <Link to={`/challans/${c.id}`}>{c.challanNumber}</Link>
                </strong>
                <span>
                  {c.status} · {c.customer?.customerName}
                </span>
              </li>
            ))}
            {!data.recentChallans.length && <li className="empty">No challans yet</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

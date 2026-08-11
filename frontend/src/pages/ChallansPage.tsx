import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Challan, Pagination } from "../types";

export function ChallansPage() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<Challan[]>([]);
  const [, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (search) qs.set("search", search);
      if (status) qs.set("status", status);
      const res = await api.get<ApiResponse<Challan[]>>(`/challans?${qs}`);
      setItems(res.data.data);
      setPagination(res.data.pagination || null);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load challans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h1>Sales challans</h1>
        </div>
        {hasRole("ADMIN", "SALES") && (
          <Link className="btn primary" to="/challans/new">
            Create challan
          </Link>
        )}
      </header>

      <form className="toolbar" onSubmit={onSearch}>
        <input
          placeholder="Search challan # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="btn">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading && <div>Loading challans…</div>}

      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Created by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/challans/${c.id}`}>{c.challanNumber}</Link>
                  </td>
                  <td>
                    {c.customer.customerName}
                    <div className="muted">{c.customer.businessName}</div>
                  </td>
                  <td>{c.totalQuantity}</td>
                  <td>
                    <span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>{c.createdBy.name}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="empty">
                    No challans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

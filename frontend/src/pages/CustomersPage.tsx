import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Customer, Pagination } from "../types";

export function CustomersPage() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (search) qs.set("search", search);
      if (status) qs.set("status", status);
      if (customerType) qs.set("customerType", customerType);
      const res = await api.get<ApiResponse<Customer[]>>(`/customers?${qs}`);
      setItems(res.data.data);
      setPagination(res.data.pagination || null);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, customerType]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">CRM</p>
          <h1>Customers</h1>
        </div>
        {hasRole("ADMIN", "SALES") && (
          <Link className="btn primary" to="/customers/new">
            Add customer
          </Link>
        )}
      </header>

      <form className="toolbar" onSubmit={onSearch}>
        <input
          placeholder="Search name, mobile, business…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
          <option value="">All types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
        <button className="btn">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading && <div>Loading customers…</div>}

      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Type</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/customers/${c.id}`}>{c.customerName}</Link>
                  </td>
                  <td>{c.businessName}</td>
                  <td>{c.customerType}</td>
                  <td>{c.mobileNumber}</td>
                  <td>
                    <span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="empty">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pager">
          <button
            className="btn ghost"
            disabled={page <= 1}
            onClick={() => {
              const p = page - 1;
              setPage(p);
              load(p);
            }}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="btn ghost"
            disabled={page >= pagination.totalPages}
            onClick={() => {
              const p = page + 1;
              setPage(p);
              load(p);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

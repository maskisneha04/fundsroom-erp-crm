import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Pagination, Product } from "../types";

export function ProductsPage() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (search) qs.set("search", search);
      if (lowStock) qs.set("lowStock", "true");
      const res = await api.get<ApiResponse<Product[]>>(`/products?${qs}`);
      setItems(res.data.data);
      setPagination(res.data.pagination || null);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStock]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Products</h1>
        </div>
        {hasRole("ADMIN", "WAREHOUSE") && (
          <Link className="btn primary" to="/products/new">
            Add product
          </Link>
        )}
      </header>

      <form className="toolbar" onSubmit={onSearch}>
        <input
          placeholder="Search name, SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="check">
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
          Low stock only
        </label>
        <button className="btn">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading && <div>Loading products…</div>}

      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/products/${p.id}`}>{p.productName}</Link>
                    {p.isLowStock && <span className="badge lead"> LOW</span>}
                  </td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>₹{Number(p.unitPrice).toFixed(2)}</td>
                  <td className={p.isLowStock ? "stock-low" : ""}>
                    {p.currentStock}
                    <small className="muted"> / min {p.minimumStockAlertQuantity}</small>
                  </td>
                  <td>{p.warehouseLocation}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="empty">
                    No products found
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

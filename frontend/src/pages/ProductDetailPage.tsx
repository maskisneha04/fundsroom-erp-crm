import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Product, StockMovement } from "../types";

export function ProductDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Purchase received");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [p, m] = await Promise.all([
      api.get<ApiResponse<Product>>(`/products/${id}`),
      api.get<ApiResponse<StockMovement[]>>(`/products/${id}/stock-movements?limit=20`),
    ]);
    setProduct(p.data.data);
    setMovements(m.data.data);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function stockIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/products/${id}/stock-in`, { quantity: Number(quantity), reason });
      setMessage("Stock updated");
      setQuantity("1");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Stock update failed");
    }
  }

  if (loading) return <div className="page">Loading product…</div>;
  if (!product) return <div className="page alert error">{error || "Not found"}</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Product detail</p>
          <h1>{product.productName}</h1>
          <p className="muted">{product.sku}</p>
        </div>
        <div className="actions">
          <Link className="btn ghost" to="/products">
            Back
          </Link>
          {hasRole("ADMIN", "WAREHOUSE") && (
            <Link className="btn" to={`/products/${product.id}/edit`}>
              Edit
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="detail-grid">
        <div>
          <h3>Details</h3>
          <dl className="kv">
            <div>
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Unit price</dt>
              <dd>₹{Number(product.unitPrice).toFixed(2)}</dd>
            </div>
            <div>
              <dt>Current stock</dt>
              <dd className={product.isLowStock ? "stock-low" : ""}>{product.currentStock}</dd>
            </div>
            <div>
              <dt>Min alert</dt>
              <dd>{product.minimumStockAlertQuantity}</dd>
            </div>
            <div className="full">
              <dt>Warehouse</dt>
              <dd>{product.warehouseLocation}</dd>
            </div>
          </dl>
        </div>

        {hasRole("ADMIN", "WAREHOUSE") && (
          <div>
            <h3>Stock In</h3>
            <form className="stack-form" onSubmit={stockIn}>
              <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <input required placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="btn primary">Add stock</button>
            </form>
          </div>
        )}
      </section>

      <section>
        <h3>Movement history</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>By</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className={`badge ${m.movementType === "IN" ? "active" : "lead"}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td>{m.quantityChanged}</td>
                  <td>{m.reason}</td>
                  <td>{m.createdBy.name}</td>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!movements.length && (
                <tr>
                  <td colSpan={5} className="empty">
                    No movements
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

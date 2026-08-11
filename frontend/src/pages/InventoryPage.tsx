import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Product, StockMovement } from "../types";

export function InventoryPage() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Purchase received");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [p, m] = await Promise.all([
      api.get<ApiResponse<Product[]>>("/products?limit=100"),
      api.get<ApiResponse<StockMovement[]>>("/products/movements/all?limit=20"),
    ]);
    setProducts(p.data.data);
    setMovements(m.data.data);
    if (!productId && p.data.data[0]) setProductId(p.data.data[0].id);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load inventory"))
      .finally(() => setLoading(false));
  }, []);

  async function stockIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/products/${productId}/stock-in`, {
        quantity: Number(quantity),
        reason,
      });
      setMessage("Stock increased successfully");
      setQuantity("1");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Stock in failed");
    }
  }

  if (loading) return <div className="page">Loading inventory…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Stock & movements</h1>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {hasRole("ADMIN", "WAREHOUSE") && (
        <section className="form-grid" style={{ marginBottom: "1.25rem" }}>
          <h3 className="full">Stock In</h3>
          <form className="full" onSubmit={stockIn} style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "2fr 1fr 2fr auto" }}>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.sku}) — stock {p.currentStock}
                </option>
              ))}
            </select>
            <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input required value={reason} onChange={(e) => setReason(e.target.value)} />
            <button className="btn primary">Stock In</button>
          </form>
        </section>
      )}

      <section style={{ marginBottom: "1.25rem" }}>
        <h3>Current stock</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Min</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/products/${p.id}`}>{p.productName}</Link>
                  </td>
                  <td>{p.sku}</td>
                  <td className={p.isLowStock ? "stock-low" : ""}>{p.currentStock}</td>
                  <td>{p.minimumStockAlertQuantity}</td>
                  <td>
                    {p.isLowStock ? (
                      <span className="badge lead">LOW STOCK</span>
                    ) : (
                      <span className="badge active">OK</span>
                    )}
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={5} className="empty">
                    No products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Recent movements</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>
                    {m.product?.productName} ({m.product?.sku})
                  </td>
                  <td>
                    <span className={`badge ${m.movementType === "IN" ? "active" : "lead"}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td>{m.quantityChanged}</td>
                  <td>{m.reason}</td>
                  <td>{m.createdBy.name}</td>
                </tr>
              ))}
              {!movements.length && (
                <tr>
                  <td colSpan={6} className="empty">
                    No movements yet
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

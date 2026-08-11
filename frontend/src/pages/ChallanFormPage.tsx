import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Challan, Customer, Product } from "../types";

type Line = { productId: string; quantity: number };

export function ChallanFormPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<Customer[]>>("/customers?limit=50"),
      api.get<ApiResponse<Product[]>>("/products?limit=100"),
    ]).then(([c, p]) => {
      setCustomers(c.data.data);
      setProducts(p.data.data);
    });
  }, []);

  const totalQty = useMemo(() => lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0), [lines]);

  if (!hasRole("ADMIN", "SALES")) {
    return <div className="alert error">You do not have permission to create challans.</div>;
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  async function submit(status: "DRAFT" | "CONFIRMED") {
    setSaving(true);
    setError("");
    try {
      const items = lines.filter((l) => l.productId && l.quantity > 0);
      if (!customerId || !items.length) {
        throw new ApiError("Select a customer and at least one product", 400);
      }
      const res = await api.post<ApiResponse<Challan>>("/challans", {
        customerId,
        items,
        status,
      });
      navigate(`/challans/${res.data.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create challan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h1>Create sales challan</h1>
        </div>
        <Link className="btn ghost" to="/challans">
          Back
        </Link>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="form-grid">
        <label>
          Customer
          <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerName} — {c.businessName}
              </option>
            ))}
          </select>
        </label>

        <div className="full">
          <h3>Products</h3>
          <div className="line-items">
            {lines.map((line, index) => {
              const product = products.find((p) => p.id === line.productId);
              return (
                <div className="line-row" key={index}>
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => updateLine(index, { productId: e.target.value })}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName} ({p.sku}) — stock {p.currentStock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    required
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                  />
                  <div className="muted">
                    {product ? `₹${Number(product.unitPrice)} · avail ${product.currentStock}` : "—"}
                  </div>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={lines.length === 1}
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setLines((prev) => [...prev, { productId: "", quantity: 1 }])}
          >
            + Add Product
          </button>
          <p className="muted">Total Quantity: {totalQty}</p>
        </div>

        <div className="form-actions full actions">
          <button className="btn" disabled={saving} onClick={() => submit("DRAFT")}>
            Save Draft
          </button>
          <button className="btn primary" disabled={saving} onClick={() => submit("CONFIRMED")}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

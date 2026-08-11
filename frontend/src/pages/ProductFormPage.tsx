import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Product } from "../types";

const empty = {
  productName: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minimumStockAlertQuantity: "0",
  warehouseLocation: "",
};

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get<ApiResponse<Product>>(`/products/${id}`).then((res) => {
      const p = res.data.data;
      setForm({
        productName: p.productName,
        sku: p.sku,
        category: p.category,
        unitPrice: String(p.unitPrice),
        currentStock: String(p.currentStock),
        minimumStockAlertQuantity: String(p.minimumStockAlertQuantity),
        warehouseLocation: p.warehouseLocation,
      });
    });
  }, [id, isEdit]);

  if (!hasRole("ADMIN", "WAREHOUSE")) {
    return <div className="alert error">You do not have permission to manage products.</div>;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        productName: form.productName,
        sku: form.sku,
        category: form.category,
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minimumStockAlertQuantity: Number(form.minimumStockAlertQuantity),
        warehouseLocation: form.warehouseLocation,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        navigate(`/products/${id}`);
      } else {
        const res = await api.post<ApiResponse<Product>>("/products", payload);
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>{isEdit ? "Edit product" : "Add product"}</h1>
        </div>
        <Link className="btn ghost" to="/products">
          Back
        </Link>
      </header>
      {error && <div className="alert error">{error}</div>}
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Product name
          <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
        </label>
        <label>
          SKU
          <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </label>
        <label>
          Category
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </label>
        <label>
          Unit price
          <input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
        </label>
        {!isEdit && (
          <label>
            Opening stock
            <input type="number" min="0" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
          </label>
        )}
        <label>
          Min stock alert
          <input type="number" min="0" value={form.minimumStockAlertQuantity} onChange={(e) => setForm({ ...form, minimumStockAlertQuantity: e.target.value })} />
        </label>
        <label className="full">
          Warehouse location
          <input required value={form.warehouseLocation} onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })} />
        </label>
        <div className="form-actions full">
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}

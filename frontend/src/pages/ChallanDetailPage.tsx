import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Challan } from "../types";

export function ChallanDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    setChallan(res.data.data);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function confirm() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/challans/${id}/confirm`);
      setMessage("Challan confirmed and stock deducted");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Confirm failed");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/challans/${id}/cancel`);
      setMessage("Challan cancelled");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page">Loading challan…</div>;
  if (!challan) return <div className="page alert error">{error || "Not found"}</div>;

  const amount = challan.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sales challan</p>
          <h1>{challan.challanNumber}</h1>
          <p className="muted">
            {challan.customer.customerName} · {challan.customer.businessName}
          </p>
        </div>
        <div className="actions">
          <Link className="btn ghost" to="/challans">
            Back
          </Link>
          {hasRole("ADMIN", "SALES") && challan.status === "DRAFT" && (
            <>
              <button className="btn primary" disabled={busy} onClick={confirm}>
                Confirm
              </button>
              <button className="btn" disabled={busy} onClick={cancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="detail-grid">
        <dl className="kv">
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`badge ${challan.status.toLowerCase()}`}>{challan.status}</span>
            </dd>
          </div>
          <div>
            <dt>Total qty</dt>
            <dd>{challan.totalQuantity}</dd>
          </div>
          <div>
            <dt>Created by</dt>
            <dd>{challan.createdBy.name}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(challan.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Line items (product snapshot)</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit price</th>
                <th>Qty</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>
                  <strong>Total</strong>
                </td>
                <td>
                  <strong>₹{amount.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

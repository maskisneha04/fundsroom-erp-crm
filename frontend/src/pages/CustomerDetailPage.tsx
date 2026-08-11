import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { ApiResponse, Customer } from "../types";

export function CustomerDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    setCustomer(res.data.data);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function addFollowUp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/customers/${id}/follow-ups`, {
        note,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : "",
      });
      setNote("");
      setFollowUpDate("");
      setMessage("Follow-up added");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add follow-up");
    }
  }

  if (loading) return <div className="page">Loading customer…</div>;
  if (!customer) return <div className="page alert error">{error || "Customer not found"}</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Customer detail</p>
          <h1>{customer.customerName}</h1>
          <p className="muted">{customer.businessName}</p>
        </div>
        <div className="actions">
          <Link className="btn ghost" to="/customers">
            Back
          </Link>
          {hasRole("ADMIN", "SALES") && (
            <Link className="btn" to={`/customers/${customer.id}/edit`}>
              Edit
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="detail-grid">
        <div>
          <h3>Profile</h3>
          <dl className="kv">
            <div>
              <dt>Mobile</dt>
              <dd>{customer.mobileNumber}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{customer.email || "—"}</dd>
            </div>
            <div>
              <dt>GST</dt>
              <dd>{customer.gstNumber || "—"}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{customer.customerType}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`badge ${customer.status.toLowerCase()}`}>{customer.status}</span>
              </dd>
            </div>
            <div>
              <dt>Follow-up</dt>
              <dd>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : "—"}</dd>
            </div>
            <div className="full">
              <dt>Address</dt>
              <dd>{customer.address}</dd>
            </div>
            <div className="full">
              <dt>Notes</dt>
              <dd>{customer.notes || "—"}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3>Follow-up notes</h3>
          {hasRole("ADMIN", "SALES") && (
            <form className="stack-form" onSubmit={addFollowUp}>
              <textarea required placeholder="Add follow-up note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              <button className="btn primary">Add follow-up</button>
            </form>
          )}
          <ul className="timeline">
            {(customer.followUps || []).map((f) => (
              <li key={f.id}>
                <strong>{f.createdBy.name}</strong>
                <span>{new Date(f.createdAt).toLocaleString()}</span>
                <p>{f.note}</p>
              </li>
            ))}
            {!customer.followUps?.length && <li className="empty">No follow-ups yet</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

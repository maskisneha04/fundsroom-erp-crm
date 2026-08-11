import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const demos = [
  { role: "Admin", email: "admin@test.com", password: "Admin@123" },
  { role: "Sales", email: "sales@test.com", password: "Sales@123" },
  { role: "Warehouse", email: "warehouse@test.com", password: "Warehouse@123" },
  { role: "Accounts", email: "accounts@test.com", password: "Accounts@123" },
];

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-hero">
          <p className="eyebrow">Wholesale Operations</p>
          <h1>Nexus Ops</h1>
          <p>Mini ERP + CRM for customers, inventory, and sales challans.</p>
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          {error && <div className="alert error">{error}</div>}
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <button className="btn primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <div className="demo-accounts">
            <p>Demo accounts (click to fill)</p>
            <div className="demo-grid">
              {demos.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  className="demo-chip"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                  }}
                >
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

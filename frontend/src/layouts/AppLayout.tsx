import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const { user, loading, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">NX</span>
          <div>
            <strong>Nexus Ops</strong>
            <small>ERP + CRM Portal</small>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          {hasRole("ADMIN", "SALES", "ACCOUNTS") && <NavLink to="/customers">Customers</NavLink>}
          {hasRole("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS") && (
            <NavLink to="/products">Products</NavLink>
          )}
          {hasRole("ADMIN", "WAREHOUSE", "ACCOUNTS", "SALES") && (
            <NavLink to="/inventory">Inventory</NavLink>
          )}
          {hasRole("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS") && (
            <NavLink to="/challans">Sales Challans</NavLink>
          )}
        </nav>
        <div className="sidebar-user">
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

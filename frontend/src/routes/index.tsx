import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CustomersPage } from "../pages/CustomersPage";
import { CustomerFormPage } from "../pages/CustomerFormPage";
import { CustomerDetailPage } from "../pages/CustomerDetailPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductFormPage } from "../pages/ProductFormPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { InventoryPage } from "../pages/InventoryPage";
import { ChallansPage } from "../pages/ChallansPage";
import { ChallanFormPage } from "../pages/ChallanFormPage";
import { ChallanDetailPage } from "../pages/ChallanDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/challans" element={<ChallansPage />} />
        <Route path="/challans/new" element={<ChallanFormPage />} />
        <Route path="/challans/:id" element={<ChallanDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

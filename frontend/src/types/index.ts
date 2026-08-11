export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Customer = {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: FollowUp[];
  challans?: {
    id: string;
    challanNumber: string;
    status: string;
    totalQuantity: number;
    createdAt: string;
  }[];
};

export type FollowUp = {
  id: string;
  note: string;
  createdAt: string;
  createdBy: { id: string; name: string; role: Role };
};

export type Product = {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  quantityChanged: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdAt: string;
  createdBy: { id: string; name: string; role: Role };
  product?: { id: string; productName: string; sku: string };
};

export type ChallanItem = {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

export type Challan = {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  customer: {
    id: string;
    customerName: string;
    businessName: string;
    mobileNumber?: string;
    address?: string;
  };
  createdBy: { id: string; name: string; role: Role };
  items: ChallanItem[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DashboardSummary = {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  draftChallans: number;
  confirmedChallans: number;
  lowStockItems: Product[];
  recentChallans: Challan[];
  recentFollowUps: Array<{
    id: string;
    note: string;
    createdAt: string;
    customer: { id: string; customerName: string; businessName: string };
    createdBy: { name: string };
  }>;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  errors?: unknown;
};

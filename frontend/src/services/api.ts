import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status: number;
  data?: unknown;
  errors?: unknown;

  constructor(message: string, status: number, data?: unknown, errors?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; data?: unknown; errors?: unknown }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    const message =
      error.response?.data?.message ||
      (error.code === "ERR_NETWORK"
        ? "Cannot reach API. Is the backend running on port 5000?"
        : error.message || "Request failed");

    const data = error.response?.data?.data;
    if (data && typeof data === "object" && "availableStock" in (data as object)) {
      const d = data as {
        productName?: string;
        availableStock: number;
        requestedQuantity: number;
      };
      throw new ApiError(
        `Insufficient stock for ${d.productName || "product"}. Available: ${d.availableStock}, Requested: ${d.requestedQuantity}.`,
        error.response?.status || 400,
        data,
        error.response?.data?.errors
      );
    }

    throw new ApiError(
      message,
      error.response?.status || 0,
      error.response?.data?.data,
      error.response?.data?.errors
    );
  }
);

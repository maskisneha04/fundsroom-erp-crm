import { api } from "./api";
import type { ApiResponse, User } from "../types";

export const authService = {
  login(email: string, password: string) {
    return api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", {
      email,
      password,
    });
  },
  me() {
    return api.get<ApiResponse<User>>("/auth/me");
  },
};

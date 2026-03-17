// authApi.ts
// HTTP functions for auth endpoints used in Slice 1.
//
// Why this file exists:
//   Keep network calls outside page components so UI code stays focused on
//   rendering and interaction, while API contract handling stays centralized.

import apiClient from "@/shared/api/apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterAdminRequest,
  RegisterAdminResponse,
} from "../types";

// Calls POST /auth/login and returns the backend response unchanged.
export async function loginRequest(body: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login", body);
  return res.data;
}

// Calls POST /auth/register-admin and returns the backend response unchanged.
export async function registerAdminRequest(
  body: RegisterAdminRequest,
): Promise<RegisterAdminResponse> {
  const res = await apiClient.post<RegisterAdminResponse>(
    "/auth/register-admin",
    body,
  );
  return res.data;
}

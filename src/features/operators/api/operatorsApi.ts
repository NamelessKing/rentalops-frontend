// operatorsApi.ts
// HTTP functions operator endpoints.
//
// Why this file exists:
// Keep endpoint details in one place so pages and hooks can focus on
// UI state and user interactions instead of request construction.

import apiClient from "@/shared/api/apiClient";
import type {
  CreateOperatorRequest,
  CreateOperatorResponse,
  DisableOperatorResponse,
  EnableOperatorResponse,
  OperatorListItem,
  UpdateOperatorRequest,
  UpdateOperatorResponse,
} from "../types";

// Calls GET /users/operators and returns the operator rows for the current tenant.
// Tenant isolation is enforced by backend from JWT, so no tenant field is sent.
export async function fetchOperators(): Promise<OperatorListItem[]> {
  const res = await apiClient.get<OperatorListItem[]>("/users/operators");
  return res.data;
}

// Calls POST /users/operators to create a new operator in the current tenant.
// The backend validates specializationCategory and returns 400 for invalid values.
export async function createOperator(
  body: CreateOperatorRequest,
): Promise<CreateOperatorResponse> {
  const res = await apiClient.post<CreateOperatorResponse>(
    "/users/operators",
    body,
  );
  return res.data;
}

// Calls PUT /users/operators/{id} to update an operator's profile.
// Only include newPassword in the body if the admin wants to change it.
export async function updateOperator(
  id: string,
  body: UpdateOperatorRequest,
): Promise<UpdateOperatorResponse> {
  const res = await apiClient.put<UpdateOperatorResponse>(
    `/users/operators/${id}`,
    body,
  );
  return res.data;
}

// Calls PATCH /users/operators/{id}/disable to logically disable an operator.
export async function disableOperator(
  id: string,
): Promise<DisableOperatorResponse> {
  const res = await apiClient.patch<DisableOperatorResponse>(
    `/users/operators/${id}/disable`,
  );
  return res.data;
}

// Calls PATCH /users/operators/{id}/enable to re-activate a disabled operator.
// Idempotent — safe to call even if the operator is already ACTIVE.
export async function enableOperator(
  id: string,
): Promise<EnableOperatorResponse> {
  const res = await apiClient.patch<EnableOperatorResponse>(
    `/users/operators/${id}/enable`,
  );
  return res.data;
}

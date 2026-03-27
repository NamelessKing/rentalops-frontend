// types/index.ts — Operators feature type definitions
//
// These types mirror the Slice 2 backend contract for operators.
// Keeping exact field names helps prevent subtle integration bugs.

// Allowed specialization values confirmed by backend handoff.
// Use a string union to keep JSON payloads simple and type-safe.
export type SpecializationCategory =
  | "CLEANING"
  | "PLUMBING"
  | "ELECTRICAL"
  | "GENERAL_MAINTENANCE";

// Operator status values used in list and admin workflows.
export type OperatorStatus = "ACTIVE" | "DISABLED";

// Role is fixed by backend for operator creation responses.
export type OperatorRole = "OPERATOR";

// Row shape returned by GET /users/operators.
// This is what list pages should render directly.
export interface OperatorListItem {
  id: string;
  fullName: string;
  email: string;
  status: OperatorStatus;
  specializationCategory: SpecializationCategory;
}

// Request body for POST /users/operators.
// initialPassword is required by backend and must be sent as-is.
export interface CreateOperatorRequest {
  fullName: string;
  email: string;
  initialPassword: string;
  specializationCategory: SpecializationCategory;
}

// Response body for POST /users/operators.
// Backend currently creates operators as ACTIVE with role OPERATOR.
export interface CreateOperatorResponse {
  id: string;
  fullName: string;
  email: string;
  role: OperatorRole;
  status: "ACTIVE";
  specializationCategory: SpecializationCategory;
}

// Request body for PUT /users/operators/{id}.
// newPassword is optional — omit or send blank to keep the current password.
export interface UpdateOperatorRequest {
  fullName: string;
  email: string;
  newPassword?: string | null;
  specializationCategory: SpecializationCategory;
}

// Response body for PUT /users/operators/{id}.
// Status can vary (e.g. the operator might already be DISABLED when edited).
export interface UpdateOperatorResponse {
  id: string;
  fullName: string;
  email: string;
  role: OperatorRole;
  status: OperatorStatus;
  specializationCategory: SpecializationCategory;
}

// Response body for PATCH /users/operators/{id}/disable.
export interface DisableOperatorResponse {
  id: string;
  status: "DISABLED";
}

// Response body for PATCH /users/operators/{id}/enable.
// The endpoint is idempotent — safe to call even if already ACTIVE.
export interface EnableOperatorResponse {
  id: string;
  status: "ACTIVE";
}

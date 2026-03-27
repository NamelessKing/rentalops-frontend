// types/index.ts — Auth feature type definitions
//
// These types mirror the fields returned by the backend on login.
// Field names must match the backend API contract exactly.
// Do not rename fields (e.g. tenantId must stay tenantId, not workspaceId).

// The role values the backend can return.
// String union instead of enum — simpler to use with JSON and API responses.
export type Role = "ADMIN" | "OPERATOR";

// Represents the authenticated user stored in React context after login.
// This is a subset of what the API returns — only what the frontend needs
// at a global level (routing, guards, navbar display).
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  tenantId: string;
}

// Request body for POST /auth/login.
// Field names must match docs/08-api-draft.md exactly.
export interface LoginRequest {
  email: string;
  password: string;
}

// Response body for POST /auth/login.
// Keep nested shape unchanged: { accessToken, user: { ... } }.
export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// Request body for POST /auth/register-admin.
// Keep exact field names from docs/08-api-draft.md.
export interface RegisterAdminRequest {
  fullName: string;
  email: string;
  password: string;
  workspaceName: string;
}

// Response body for POST /auth/register-admin.
// Register response has no accessToken; login is required after register.
export interface RegisterAdminResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "ADMIN";
  };
  tenant: {
    id: string;
    name: string;
  };
}

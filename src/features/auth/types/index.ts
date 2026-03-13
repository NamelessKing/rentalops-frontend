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

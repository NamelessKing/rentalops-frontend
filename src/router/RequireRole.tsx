// RequireRole.tsx
// Route guard that restricts access by user role.
//
// This guard is always used INSIDE RequireAuth, so by the time this runs
// we know the user is authenticated. We only need to check the role.
//
// Behaviour:
//   - If the user's role matches the required role, render the child route.
//   - If the role does not match, redirect to the user's own home area.
//     This is friendlier than showing a 403 page — the user ends up somewhere
//     useful rather than a dead end.
//
// Landing rules:
//   ADMIN    → /admin/dashboard
//   OPERATOR → /operator/tasks
//
// Usage in the route tree:
//   <Route element={<RequireRole role="ADMIN" />}>
//     <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
//   </Route>

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import type { Role } from "@/features/auth/types";

interface RequireRoleProps {
  // The role that is allowed to access the wrapped routes
  role: Role;
}

// Maps each role to its own landing page.
// Centralised here so that if the landing rules change,
// there is exactly one place to update.
const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  OPERATOR: "/operator/tasks",
};

export function RequireRole({ role }: RequireRoleProps) {
  const { user } = useAuth();

  // user is guaranteed to be non-null here because RequireRole is always
  // nested inside RequireAuth, which handles the unauthenticated case.
  // The non-null assertion is safe in this context.
  if (user!.role !== role) {
    // Send the user to their own area instead of showing an error page
    const home = ROLE_HOME[user!.role];
    return <Navigate to={home} replace />;
  }

  // Role matches — render the nested route
  return <Outlet />;
}

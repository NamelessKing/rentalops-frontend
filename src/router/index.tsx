// router/index.tsx
// The central route tree for the entire application.
//
// Route layout:
//
//   /                         → redirect to /login
//   PublicLayout
//     /register               → public
//     /login                  → public
//   RequireAuth
//     RequireRole("ADMIN")
//       AdminLayout
//         /admin/dashboard
//         /admin/operators
//         /admin/operators/new
//         /admin/operators/:operatorId/edit
//         /admin/properties
//         /admin/properties/new
//         /admin/properties/:propertyId
//         /admin/tasks
//         /admin/tasks/new
//         /admin/tasks/:taskId
//         /admin/issue-reports
//         /admin/issue-reports/:issueReportId/convert
//     RequireRole("OPERATOR")
//       OperatorLayout
//         /operator/tasks
//         /operator/tasks/:taskId
//         /operator/pool
//         /operator/issue-reports/new
//
// Guard nesting explanation:
//   React Router renders routes as a tree — each parent element wraps
//   every child route. So nesting under <RequireAuth> guarantees auth
//   is checked, then nesting under <RequireRole> checks the role,
//   and finally the layout renders with <Outlet />.

import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { OperatorLayout } from "@/layouts/OperatorLayout";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OperatorListPage } from "@/pages/OperatorListPage";
import { CreateOperatorPage } from "@/pages/CreateOperatorPage";
import { EditOperatorPage } from "@/pages/EditOperatorPage";
import { PropertyListPage } from "@/pages/PropertyListPage";
import { CreatePropertyPage } from "@/pages/CreatePropertyPage";
import { PropertyDetailPage } from "@/pages/PropertyDetailPage";

export function AppRouter() {
  return (
    <Routes>
      {/* ── Root redirect ──────────────────────────────────────────────────── */}
      {/* Hitting / sends users to /login; post-login redirect is handled
          by the login flow based on role (ADMIN → dashboard, OPERATOR → tasks) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Public area ────────────────────────────────────────────────────── */}
      {/* PublicLayout provides the centred, navbar-free shell */}
      <Route element={<PublicLayout />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── Admin area ─────────────────────────────────────────────────────── */}
      {/* RequireAuth checks authentication first, then RequireRole checks
          that the authenticated user is specifically an ADMIN */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole role="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={<PlaceholderPage title="Admin Dashboard" />}
            />
            <Route path="/admin/operators" element={<OperatorListPage />} />
            <Route
              path="/admin/operators/new"
              element={<CreateOperatorPage />}
            />
            <Route
              path="/admin/operators/:operatorId/edit"
              element={<EditOperatorPage />}
            />
            <Route path="/admin/properties" element={<PropertyListPage />} />
            <Route
              path="/admin/properties/new"
              element={<CreatePropertyPage />}
            />
            <Route
              path="/admin/properties/:propertyId"
              element={<PropertyDetailPage />}
            />
            <Route
              path="/admin/tasks"
              element={<PlaceholderPage title="Tasks" />}
            />
            <Route
              path="/admin/tasks/new"
              element={<PlaceholderPage title="New Task" />}
            />
            <Route
              path="/admin/tasks/:taskId"
              element={<PlaceholderPage title="Task Detail" />}
            />
            <Route
              path="/admin/issue-reports"
              element={<PlaceholderPage title="Issue Reports" />}
            />
            <Route
              path="/admin/issue-reports/:issueReportId/convert"
              element={<PlaceholderPage title="Convert Issue Report" />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── Operator area ──────────────────────────────────────────────────── */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole role="OPERATOR" />}>
          <Route element={<OperatorLayout />}>
            <Route
              path="/operator/tasks"
              element={<PlaceholderPage title="My Tasks" />}
            />
            <Route
              path="/operator/tasks/:taskId"
              element={<PlaceholderPage title="Task Detail" />}
            />
            <Route
              path="/operator/pool"
              element={<PlaceholderPage title="Task Pool" />}
            />
            <Route
              path="/operator/issue-reports/new"
              element={<PlaceholderPage title="Create Issue Report" />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

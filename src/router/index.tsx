// router/index.tsx
// The central route tree for the entire application.
//
// Route layout:
//
//   /                         → HomeLayout → AppHomePage (public entry point)
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

import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { OperatorLayout } from "@/layouts/OperatorLayout";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OperatorListPage } from "@/pages/OperatorListPage";
import { CreateOperatorPage } from "@/pages/CreateOperatorPage";
import { EditOperatorPage } from "@/pages/EditOperatorPage";
import { PropertyListPage } from "@/pages/PropertyListPage";
import { CreatePropertyPage } from "@/pages/CreatePropertyPage";
import { PropertyDetailPage } from "@/pages/PropertyDetailPage";
import { TaskListAdminPage } from "@/pages/TaskListAdminPage";
import { CreateTaskPage } from "@/pages/CreateTaskPage";
import { AdminTaskDetailPage } from "@/pages/AdminTaskDetailPage";
import { OperatorMyTasksPage } from "@/pages/OperatorMyTasksPage";
import { OperatorTaskDetailPage } from "@/pages/OperatorTaskDetailPage";
import { OperatorPoolPage } from "@/pages/OperatorPoolPage";
import { CreateIssueReportPage } from "@/pages/CreateIssueReportPage";
import { IssueReportListAdminPage } from "@/pages/IssueReportListAdminPage";
import { IssueReportDetailAdminPage } from "@/pages/IssueReportDetailAdminPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AppHomePage } from "@/pages/AppHomePage";
import { HomeLayout } from "@/layouts/HomeLayout";

export function AppRouter() {
  return (
    <Routes>
      {/* ── App homepage ────────────────────────────────────────────────────── */}
      {/* "/" is the public entry point of the app. HomeLayout provides the
          thin public navbar (brand + Login / Register links). No auth guard.
          Post-login redirects (ADMIN → /admin/dashboard, OPERATOR → /operator/tasks)
          are handled by the login flow and are not affected by this route. */}
      <Route element={<HomeLayout />}>
        <Route path="/" element={<AppHomePage />} />
      </Route>

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
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
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
            <Route path="/admin/tasks" element={<TaskListAdminPage />} />
            <Route path="/admin/tasks/new" element={<CreateTaskPage />} />
            <Route
              path="/admin/tasks/:taskId"
              element={<AdminTaskDetailPage />}
            />
            <Route
              path="/admin/issue-reports"
              element={<IssueReportListAdminPage />}
            />
            <Route
              path="/admin/issue-reports/:issueReportId/convert"
              element={<IssueReportDetailAdminPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── Operator area ──────────────────────────────────────────────────── */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole role="OPERATOR" />}>
          <Route element={<OperatorLayout />}>
            <Route path="/operator/tasks" element={<OperatorMyTasksPage />} />
            <Route
              path="/operator/tasks/:taskId"
              element={<OperatorTaskDetailPage />}
            />
            <Route path="/operator/pool" element={<OperatorPoolPage />} />
            <Route
              path="/operator/issue-reports/new"
              element={<CreateIssueReportPage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

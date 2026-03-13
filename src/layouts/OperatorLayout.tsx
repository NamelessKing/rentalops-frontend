// OperatorLayout.tsx
// Shell for all /operator/* routes. Visible only to authenticated OPERATOR users.
//
// Responsibilities:
//   - Reduced, mobile-first navigation (operators work primarily on mobile).
//   - Quick access to My Tasks, Pool, and Create Issue Report.
//   - Simpler shell compared to AdminLayout.
//
// Links match exactly the application's Operator route structure.

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export function OperatorLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ── Top navigation bar (darker shade to visually distinguish from Admin) ── */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary px-3">
        <span className="navbar-brand fw-bold">RentalOps</span>

        {/* Mobile toggle — important because operators often use phones */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#operatorNav"
          aria-controls="operatorNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="operatorNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/operator/tasks">
                My Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/operator/pool">
                Pool
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/operator/issue-reports/new">
                Report Issue
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">{user?.fullName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content area ── */}
      <main className="container py-4 flex-grow-1">
        {/* container (not container-fluid) keeps operator pages narrower
            and more readable on desktop, while still working on mobile */}
        <Outlet />
      </main>
    </div>
  );
}

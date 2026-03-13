// AdminLayout.tsx
// Shell for all /admin/* routes. Visible only to authenticated ADMIN users.
//
// Responsibilities:
//   - Navbar with quick access to all Admin areas.
//   - Consistent header across every Admin page.
//   - Central content area where child pages are rendered.
//
// The navbar links match exactly the application's Admin route structure.
//
// No business logic lives here — layout only.

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ── Top navigation bar ── */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        {/* Brand / logo area */}
        <span className="navbar-brand fw-bold">RentalOps Admin</span>

        {/* Mobile toggle button — collapses links on small screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNav"
          aria-controls="adminNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="adminNav">
          {/* Primary navigation links */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              {/* NavLink adds the Bootstrap `active` class automatically
                  when the current URL matches the `to` path */}
              <NavLink className="nav-link" to="/admin/dashboard">
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/operators">
                Operators
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/properties">
                Properties
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/tasks">
                Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/issue-reports">
                Issue Reports
              </NavLink>
            </li>
          </ul>

          {/* Right-side: show current user name and logout button */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">{user?.fullName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content area ── */}
      {/* container-fluid + py-4 gives consistent padding on all Admin pages */}
      <main className="container-fluid py-4 flex-grow-1">
        {/* React Router renders the matched child route here */}
        <Outlet />
      </main>
    </div>
  );
}

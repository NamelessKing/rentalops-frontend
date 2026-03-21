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
import { useEffect, useRef, useState } from "react";

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeMenu = () => setIsMenuOpen(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    toggleButtonRef.current?.setAttribute(
      "aria-expanded",
      isMenuOpen ? "true" : "false",
    );
  }, [isMenuOpen]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ── Top navigation bar ── */}
      {/* ro-admin-nav class: light surface bg with primary-colored brand and
          subtle bottom border. Defined in src/styles/theme.css. */}
      <nav className="navbar navbar-expand-lg ro-admin-nav px-3">
        {/* Brand / logo area */}
        <span className="navbar-brand fw-bold">
          RentalOps
          {/* Muted sub-label so users know they're in the admin zone */}
          <span
            className="ms-1 text-muted fw-normal"
            style={{ fontSize: "0.75rem", opacity: 0.65 }}
          >
            Admin
          </span>
        </span>

        {/* Mobile toggle button — collapses links on small screens */}
        <button
          ref={toggleButtonRef}
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-controls="adminNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`navbar-collapse collapse ${isMenuOpen ? "show" : ""}`}
          id="adminNav"
        >
          {/* Primary navigation links */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              {/* NavLink adds the Bootstrap `active` class automatically
                  when the current URL matches the `to` path */}
              <NavLink
                className="nav-link"
                to="/admin/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/admin/operators"
                onClick={closeMenu}
              >
                Operators
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/admin/properties"
                onClick={closeMenu}
              >
                Properties
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/admin/tasks"
                onClick={closeMenu}
              >
                Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/admin/issue-reports"
                onClick={closeMenu}
              >
                Issue Reports
              </NavLink>
            </li>
          </ul>

          {/* Right-side: user identifier + logout.
               On xs (mobile) we show only the two-letter initials to prevent
               long names from overflowing the navbar on small screens. */}
          <div className="d-flex align-items-center gap-3">
            {/* Full name on sm and above */}
            <span
              className="d-none d-sm-inline small"
              style={{ color: "var(--ro-text-muted)" }}
            >
              {user?.fullName}
            </span>
            {/* Avatar circle with initials on xs */}
            <span
              className="d-inline d-sm-none ro-nav-avatar"
              aria-label={user?.fullName ?? "User"}
            >
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content area ── */}
      {/* container-fluid + ro-page-content gives consistent padding on all Admin pages */}
      <main className="container-fluid ro-page-content flex-grow-1">
        {/* React Router renders the matched child route here */}
        <Outlet />
      </main>
    </div>
  );
}

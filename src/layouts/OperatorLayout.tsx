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
import { useEffect, useRef, useState } from "react";

export function OperatorLayout() {
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
      {/* ── Top navigation bar (darker shade to visually distinguish from Admin) ── */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary px-3">
        <span className="navbar-brand fw-bold">RentalOps</span>

        {/* Mobile toggle — important because operators often use phones */}
        <button
          ref={toggleButtonRef}
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-controls="operatorNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`navbar-collapse collapse ${isMenuOpen ? "show" : ""}`}
          id="operatorNav"
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/operator/tasks"
                onClick={closeMenu}
              >
                My Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/operator/pool"
                onClick={closeMenu}
              >
                Pool
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/operator/issue-reports/new"
                onClick={closeMenu}
              >
                Report Issue
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">{user?.fullName}</span>
            <button
              className="btn btn-outline-light btn-sm"
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
      <main className="container py-4 flex-grow-1">
        {/* container (not container-fluid) keeps operator pages narrower
            and more readable on desktop, while still working on mobile */}
        <Outlet />
      </main>
    </div>
  );
}

// HomeLayout.tsx
// Shell for the public app homepage at "/".
//
// Keeps the page anchored to the app visually with a minimal top bar
// showing the brand and links to Login / Register. No authentication
// state is read here — this layout is entirely public.
//
// <Outlet /> is where React Router injects the matched child page
// (currently AppHomePage).

import { Link, Outlet } from "react-router-dom";

export function HomeLayout() {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--ro-bg)" }}
    >
      {/* ── Top bar ── */}
      {/* ro-home-nav is a lightweight variant of the app navbar defined in
          theme.css. It carries no role-specific accent — it is neutral and
          public, matching the surface background of the admin area. */}
      <nav className="navbar ro-home-nav px-3">
        {/* Brand — clicking it reloads the homepage */}
        <Link className="navbar-brand fw-bold" to="/">
          RentalOps
        </Link>

        {/* Auth links always visible — no mobile toggle needed for just two items */}
        <div className="d-flex gap-2 ms-auto">
          <Link className="btn btn-sm btn-outline-secondary" to="/login">
            Login
          </Link>
          <Link className="btn btn-sm btn-primary" to="/register">
            Register
          </Link>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}

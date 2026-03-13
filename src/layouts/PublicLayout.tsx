// PublicLayout.tsx
// Shell for unauthenticated pages: /register and /login.
//
// Responsibilities:
//   - Keep the UI minimal and focused — no application navbar.
//   - Centre the content on the page for a clean auth form presentation.
//
// <Outlet /> is where React Router renders the matched child route
// (RegisterPage or LoginPage).

import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    // d-flex + flex-column + min-vh-100 ensures the page fills the viewport
    // vertically even on short content.
    <div className="d-flex flex-column min-vh-100 bg-light">
      <main className="d-flex flex-grow-1 justify-content-center align-items-center py-5">
        {/* The auth form will be rendered here by React Router */}
        <Outlet />
      </main>
    </div>
  );
}

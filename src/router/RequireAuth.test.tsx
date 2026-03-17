// RequireAuth.test.tsx
// Ensures the auth guard protects private routes and redirects unauthenticated users.
//
// Why this file exists:
//   Route guards are easy to misunderstand for beginners; these tests document
//   the expected behavior in the two core branches: blocked vs allowed access.

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import type { AuthUser } from "@/features/auth/types";

// Controlled auth state lets us test each guard branch deterministically.
const mockUseAuth = vi.fn();

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderRequireAuth() {
  // This mini route tree mirrors real app behavior around /login and protected pages.
  return render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("redirects unauthenticated users to /login", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    renderRequireAuth();

    // If guard fails correctly, protected content is replaced by login route.
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected route for authenticated users", () => {
    const user: AuthUser = {
      id: "u-1",
      fullName: "Admin User",
      email: "admin@test.local",
      role: "ADMIN",
      tenantId: "t-1",
    };

    mockUseAuth.mockReturnValue({ user, isLoading: false });

    renderRequireAuth();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});

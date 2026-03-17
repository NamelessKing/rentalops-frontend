// RequireRole.test.tsx
// Verifies role-based route authorization for matched and mismatched roles.
//
// Why this file exists:
//   Authenticated users can still be unauthorized for a specific area.
//   This guard is the last safety layer before rendering role-specific screens.

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireRole } from "./RequireRole";
import type { AuthUser } from "@/features/auth/types";

// We control the logged-in user role to test both authorization branches.
const mockUseAuth = vi.fn();

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RequireRole", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("renders content when role matches", () => {
    const user: AuthUser = {
      id: "u-1",
      fullName: "Admin User",
      email: "admin@test.local",
      role: "ADMIN",
      tenantId: "t-1",
    };

    mockUseAuth.mockReturnValue({ user });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to operator home when role does not match", () => {
    const user: AuthUser = {
      id: "u-2",
      fullName: "Operator User",
      email: "operator@test.local",
      role: "OPERATOR",
      tenantId: "t-1",
    };

    mockUseAuth.mockReturnValue({ user });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          {/* These targets let us assert exactly where mismatched roles are sent. */}
          <Route path="/operator/tasks" element={<div>Operator Home</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Home</div>} />
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // OPERATOR trying to open ADMIN route must land on operator home.
    expect(screen.getByText("Operator Home")).toBeInTheDocument();
  });
});

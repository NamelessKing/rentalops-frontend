// useLogin.test.ts
// Verifies the login hook orchestration for both supported roles.
//
// Why this file exists:
//   The hook owns side effects (API call, auth persistence, and navigation),
//   so we test it in isolation to ensure role-based redirects stay deterministic.

import { act, renderHook, waitFor } from "@testing-library/react";
import { useLogin } from "./useLogin";
import type { LoginResponse } from "../types";

// We mock side-effect boundaries so the test focuses only on hook decisions.
const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLoginRequest = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("../api/authApi", () => ({
  loginRequest: (...args: unknown[]) => mockLoginRequest(...args),
}));

// Tests the full orchestration contract exposed by useLogin.submit().
describe("useLogin", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
    mockLoginRequest.mockReset();
  });

  it("persists auth and redirects ADMIN to /admin/dashboard", async () => {
    const response: LoginResponse = {
      accessToken: "token-1",
      user: {
        id: "u-1",
        fullName: "Admin User",
        email: "admin@test.local",
        role: "ADMIN",
        tenantId: "t-1",
      },
    };

    mockLoginRequest.mockResolvedValue(response);

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.submit({
        email: "admin@test.local",
        password: "secret123",
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        response.accessToken,
        response.user,
      );
      // replace:true prevents leaving a stale /login entry in browser history.
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", {
        replace: true,
      });
    });
  });

  it("persists auth and redirects OPERATOR to /operator/tasks", async () => {
    const response: LoginResponse = {
      accessToken: "token-2",
      user: {
        id: "u-2",
        fullName: "Operator User",
        email: "operator@test.local",
        role: "OPERATOR",
        tenantId: "t-1",
      },
    };

    mockLoginRequest.mockResolvedValue(response);

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.submit({
        email: "operator@test.local",
        password: "secret123",
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        response.accessToken,
        response.user,
      );
      // Operator users must always land in operator area, not admin defaults.
      expect(mockNavigate).toHaveBeenCalledWith("/operator/tasks", {
        replace: true,
      });
    });
  });
});

// useRegister.test.ts
// Verifies how the register hook maps backend outcomes to user-facing behavior.
//
// Why this file exists:
//   Registration is a high-friction flow for new users, so error mapping and
//   post-success navigation must remain stable and easy to reason about.

import { act, renderHook, waitFor } from "@testing-library/react";
import { useRegister } from "./useRegister";

// These mocks isolate navigation and HTTP concerns from hook logic.
const mockNavigate = vi.fn();
const mockRegisterAdminRequest = vi.fn();

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

vi.mock("../api/authApi", () => ({
  registerAdminRequest: (...args: unknown[]) =>
    mockRegisterAdminRequest(...args),
}));

// Covers happy path plus the main API error contracts used by the page.
describe("useRegister", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockRegisterAdminRequest.mockReset();
  });

  it("redirects to /login with success message after successful registration", async () => {
    mockRegisterAdminRequest.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submit({
        fullName: "Admin User",
        email: "admin@test.local",
        password: "secret123",
        workspaceName: "Acme Rentals",
      });
    });

    await waitFor(() => {
      // Success message is passed through route state so LoginPage can render it.
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        replace: true,
        state: { successMessage: "Workspace created. You can now sign in." },
      });
      expect(result.current.error).toBeNull();
    });
  });

  it("shows 409 conflict message when email already exists", async () => {
    // 409 is a core UX path for duplicate email during onboarding.
    mockRegisterAdminRequest.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { detail: "Email already exists for this tenant." },
      },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submit({
        fullName: "Admin User",
        email: "admin@test.local",
        password: "secret123",
        workspaceName: "Acme Rentals",
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Email already exists for this tenant.",
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("normalizes first field error for 400 validation responses", async () => {
    // Backend can return arrays of field errors; we expose the first clear message.
    mockRegisterAdminRequest.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          errors: {
            email: ["Email format is invalid."],
          },
        },
      },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.submit({
        fullName: "Admin User",
        email: "invalid-email",
        password: "secret123",
        workspaceName: "Acme Rentals",
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Email format is invalid.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

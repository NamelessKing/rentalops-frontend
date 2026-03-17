// LoginPage.test.tsx
// Validates the public login UI behavior against auth error contracts.
//
// Why this file exists:
//   It ensures a beginner-friendly UX: each backend status is translated into
//   a specific, understandable message instead of a generic failure.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

// Mock routing and auth modules so we can focus on page behavior only.
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

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  loginRequest: (...args: unknown[]) => mockLoginRequest(...args),
}));

// Helper keeps each test focused on scenario steps instead of render boilerplate.
function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
    mockLoginRequest.mockReset();
  });

  it("submits valid credentials and shows 400 validation feedback", async () => {
    // 400 represents format/validation problems, not invalid credentials.
    mockLoginRequest.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400 },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@test.local" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLoginRequest).toHaveBeenCalledWith({
        email: "admin@test.local",
        password: "secret123",
      });
      expect(
        screen.getByText("Validation error: check email and password format."),
      ).toBeInTheDocument();
    });
  });

  it("shows 401 invalid credentials feedback", async () => {
    // 401 should explicitly guide the user to check credentials.
    mockLoginRequest.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@test.local" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Invalid credentials. Please check email and password.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows 403 disabled account feedback", async () => {
    // 403 has different meaning than 401: account exists but is disabled.
    mockLoginRequest.mockRejectedValue({
      isAxiosError: true,
      response: { status: 403 },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@test.local" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Your account is disabled. Contact your administrator.",
        ),
      ).toBeInTheDocument();
    });
  });
});

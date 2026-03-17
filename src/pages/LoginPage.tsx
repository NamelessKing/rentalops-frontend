// LoginPage.tsx
// Public login screen for Slice 1 auth integration.
//
// Why this page exists:
//   This is the entry point for both ADMIN and OPERATOR users to obtain
//   an access token and reach their role-specific home route.

import { useState, type ComponentProps } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks/useLogin";

interface LoginLocationState {
  successMessage?: string;
}

export function LoginPage() {
  const location = useLocation();
  const { submitting, error, submit } = useLogin();
  const successMessage = (location.state as LoginLocationState | null)
    ?.successMessage;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const nextErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    e,
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await submit({ email, password });
  };

  return (
    <div
      className="card shadow-sm"
      style={{ width: "100%", maxWidth: "460px" }}
    >
      <div className="card-body p-4 p-md-5">
        <h1 className="h4 mb-2">Sign in</h1>
        <p className="text-muted mb-4">
          Access RentalOps with your credentials.
        </p>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="user@example.com"
              autoComplete="email"
              required
            />
            {fieldErrors.email && (
              <div className="invalid-feedback">{fieldErrors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              autoComplete="current-password"
              required
            />
            {fieldErrors.password && (
              <div className="invalid-feedback">{fieldErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="small text-muted mt-3 mb-0 text-center">
          Need a workspace? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

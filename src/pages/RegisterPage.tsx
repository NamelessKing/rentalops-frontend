// RegisterPage.tsx
// Public register screen for ADMIN onboarding in Slice 1.
//
// Why this page exists:
//   It creates the first admin user and workspace via backend contract
//   and then redirects to login because register does not return accessToken.

import { useState, type ComponentProps } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "@/features/auth/hooks/useRegister";

export function RegisterPage() {
  const { submitting, error, submit } = useRegister();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    workspaceName?: string;
  }>({});

  function validate() {
    const nextErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      workspaceName?: string;
    } = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!workspaceName.trim()) {
      nextErrors.workspaceName = "Workspace name is required.";
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

    await submit({ fullName, email, password, workspaceName });
  };

  return (
    <div
      className="card shadow-sm"
      style={{ width: "100%", maxWidth: "520px" }}
    >
      <div className="card-body p-4 p-md-5">
        <h1 className="h4 mb-2">Create workspace</h1>
        <p className="text-muted mb-4">
          Register the first admin account for your tenant.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              className={`form-control ${fieldErrors.fullName ? "is-invalid" : ""}`}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              placeholder="Mario Rossi"
              autoComplete="name"
              required
            />
            {fieldErrors.fullName && (
              <div className="invalid-feedback">{fieldErrors.fullName}</div>
            )}
          </div>

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
              placeholder="mario@example.com"
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
              autoComplete="new-password"
              required
            />
            {fieldErrors.password && (
              <div className="invalid-feedback">{fieldErrors.password}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="workspaceName" className="form-label">
              Workspace name
            </label>
            <input
              id="workspaceName"
              type="text"
              className={`form-control ${fieldErrors.workspaceName ? "is-invalid" : ""}`}
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                if (fieldErrors.workspaceName) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    workspaceName: undefined,
                  }));
                }
              }}
              placeholder="Mario Rentals"
              required
            />
            {fieldErrors.workspaceName && (
              <div className="invalid-feedback">
                {fieldErrors.workspaceName}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>

        <p className="small text-muted mt-3 mb-0 text-center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

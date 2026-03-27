// CreateOperatorPage.tsx
// Admin form page for creating a new operator in the current tenant.
//
// Why this page exists:
// Slice 2 requires Admin users to build the team before task workflows start.

import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOperator } from "@/features/operators/hooks/useCreateOperator";
import type { SpecializationCategory } from "@/features/operators/types";
import { PageHeader } from "@/shared/components/PageHeader";

const specializationOptions: Array<{
  value: SpecializationCategory;
  label: string;
}> = [
  { value: "CLEANING", label: "Cleaning" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "GENERAL_MAINTENANCE", label: "General maintenance" },
];

export function CreateOperatorPage() {
  const navigate = useNavigate();
  const { submitting, error, submit } = useCreateOperator();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [specializationCategory, setSpecializationCategory] =
    useState<SpecializationCategory>("CLEANING");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    initialPassword?: string;
  }>({});

  function validate() {
    const nextErrors: {
      fullName?: string;
      email?: string;
      initialPassword?: string;
    } = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!initialPassword) {
      nextErrors.initialPassword = "Initial password is required.";
    } else if (initialPassword.length < 8) {
      nextErrors.initialPassword = "Password must be at least 8 characters.";
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

    const created = await submit({
      fullName: fullName.trim(),
      email: email.trim(),
      initialPassword,
      specializationCategory,
    });

    if (!created) {
      return;
    }

    navigate("/admin/operators", {
      replace: true,
      state: { successMessage: `${created.fullName} created successfully.` },
    });
  };

  return (
    <section>
      {/* PageHeader provides a consistent title + subtitle + back-nav button across all create pages. */}
      <PageHeader
        title="Create Operator"
        subtitle="Create an operator account and share the initial password manually."
        action={
          <Link
            to="/admin/operators"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Back to Team
          </Link>
        }
      />

      {/* ro-form-card gives the form a max-width + warm-surface card appearance. */}
      <div className="ro-form-card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full name
            </label>
            <input
              id="fullName"
              className={`form-control ${fieldErrors.fullName ? "is-invalid" : ""}`}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    fullName: undefined,
                  }));
                }
              }}
              placeholder="Giulia Verdi"
              disabled={submitting}
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
              placeholder="giulia@example.com"
              autoComplete="email"
              disabled={submitting}
              required
            />
            {fieldErrors.email && (
              <div className="invalid-feedback">{fieldErrors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="initialPassword" className="form-label">
              Initial password
            </label>
            <input
              id="initialPassword"
              type="password"
              className={`form-control ${fieldErrors.initialPassword ? "is-invalid" : ""}`}
              value={initialPassword}
              onChange={(e) => {
                setInitialPassword(e.target.value);
                if (fieldErrors.initialPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    initialPassword: undefined,
                  }));
                }
              }}
              autoComplete="new-password"
              disabled={submitting}
              required
            />
            {fieldErrors.initialPassword && (
              <div className="invalid-feedback">
                {fieldErrors.initialPassword}
              </div>
            )}
            <div className="form-text">
              Use at least 8 characters. Backend also requires uppercase,
              number, and special character.
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="specializationCategory" className="form-label">
              Specialization
            </label>
            <select
              id="specializationCategory"
              className="form-select"
              value={specializationCategory}
              onChange={(e) =>
                setSpecializationCategory(
                  e.target.value as SpecializationCategory,
                )
              }
              disabled={submitting}
            >
              {specializationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creating…
              </>
            ) : (
              "Create Operator"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

// useRegister.ts
// Orchestrates register submit flow for the Register page.
//
// Why this hook exists:
//   The page stays focused on form rendering while this hook handles
//   API contract calls, status-based error mapping, and post-success navigation.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { registerAdminRequest } from "../api/authApi";
import type { RegisterAdminRequest } from "../types";

interface ProblemDetailLike {
  detail?: string;
  errors?: Record<string, string | string[]>;
}

export function useRegister() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(values: RegisterAdminRequest) {
    setSubmitting(true);
    setError(null);

    try {
      await registerAdminRequest(values);

      // Register response has no accessToken, so the user must log in next.
      navigate("/login", {
        replace: true,
        state: { successMessage: "Workspace created. You can now sign in." },
      });
    } catch (err) {
      if (axios.isAxiosError<ProblemDetailLike>(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;

        if (status === 400) {
          const fieldErrors = err.response?.data?.errors;
          const firstFieldError = fieldErrors
            ? Object.values(fieldErrors)[0]
            : undefined;

          const normalizedFieldError = Array.isArray(firstFieldError)
            ? firstFieldError[0]
            : firstFieldError;

          setError(
            detail ||
              normalizedFieldError ||
              "Validation error: check all required fields.",
          );
          return;
        }

        if (status === 409) {
          setError(detail || "This email is already in use.");
          return;
        }
      }

      setError("Unexpected error during registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    error,
    submit,
  };
}

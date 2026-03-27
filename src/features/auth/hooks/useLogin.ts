// useLogin.ts
// Orchestrates the login submit flow for the Login page.
//
// Why this hook exists:
//   The page should focus on form UI states, while this hook coordinates
//   API calls, auth context persistence, role-based redirect, and error mapping.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginRequest } from "../api/authApi";
import { useAuth } from "../useAuth";
import type { LoginRequest } from "../types";

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(values: LoginRequest) {
    setSubmitting(true);
    setError(null);

    try {
      const data = await loginRequest(values);

      // Persist exactly what the backend provides after POST /auth/login.
      login(data.accessToken, data.user);

      // Deterministic post-login redirect by role.
      if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/operator/tasks", { replace: true });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          setError("Validation error: check email and password format.");
          return;
        }

        if (status === 401) {
          setError("Invalid credentials. Please check email and password.");
          return;
        }

        if (status === 403) {
          setError("Your account is disabled. Contact your administrator.");
          return;
        }
      }

      setError("Unexpected error during login. Please try again.");
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

// useCreateOperator.ts
// Handles submit lifecycle for creating operators in Slice 2.
//
// Why this hook exists:
// Centralize API call and status-based error mapping so the page component
// can stay focused on form rendering and user guidance.

import { useState } from "react";
import axios from "axios";
import { createOperator } from "../api/operatorsApi";
import type { CreateOperatorRequest, CreateOperatorResponse } from "../types";

interface ProblemDetailLike {
  detail?: string;
}

export function useCreateOperator() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    values: CreateOperatorRequest,
  ): Promise<CreateOperatorResponse | null> {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createOperator(values);
      return created;
    } catch (err) {
      if (axios.isAxiosError<ProblemDetailLike>(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;

        if (status === 400) {
          setError(detail || "Validation error: check all required fields.");
          return null;
        }

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return null;
        }

        if (status === 403) {
          setError("Only admins can create operators.");
          return null;
        }

        if (status === 409) {
          setError(detail || "An operator with this email already exists.");
          return null;
        }
      }

      setError("Unexpected error while creating operator. Please try again.");
      return null;
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

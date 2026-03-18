// useCreateProperty.ts
// Handles submit lifecycle for creating properties in Slice 2.
//
// Why this hook exists:
// Centralize API calls and status-based error mapping so page components
// can focus on form rendering and user guidance.

import { useState } from "react";
import axios from "axios";
import { createProperty } from "../api/propertiesApi";
import type { CreatePropertyRequest, PropertyDetailResponse } from "../types";

interface ProblemDetailLike {
  detail?: string;
}

// Orchestrates create-property submit flow and maps backend errors to UI messages.
export function useCreateProperty() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    values: CreatePropertyRequest,
  ): Promise<PropertyDetailResponse | null> {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createProperty(values);
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
          setError("Only admins can create properties.");
          return null;
        }

        if (status === 409) {
          setError(detail || "This property code is already in use.");
          return null;
        }
      }

      setError("Unexpected error while creating property. Please try again.");
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

// useCreateIssueReport.ts
// Manages loading of support data (property list) and the create-issue-report submit.
//
// Why this hook owns both responsibilities:
//   The Create Issue Report form needs the property list to populate a <select>
//   before the user can do anything. Keeping them together means one hook,
//   one loading state, and one error state for the page to check.
//
// The submit function returns the created report id on success, null on failure.
// The page is responsible for the redirect — the hook stays navigation-agnostic.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchProperties } from "@/features/properties/api/propertiesApi";
import { createIssueReport } from "../api/issueReportsApi";
import type { PropertyListItem } from "@/features/properties/types";
import type { CreateIssueReportRequest } from "../types";

// ProblemDetail shape returned by the backend (RFC 7807).
// Used to extract per-field validation messages from 400 responses.
interface ProblemDetailLike {
  detail?: string;
  errors?: Record<string, string>;
}

export function useCreateIssueReport() {
  // The property list needed to render the property <select> in the form.
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  // True while the property list is being fetched on mount.
  const [loadingProperties, setLoadingProperties] = useState(false);
  // Set if fetching properties fails — shown as a form-level warning.
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  // True while the POST /issue-reports request is in flight.
  const [submitting, setSubmitting] = useState(false);
  // Set if the submit fails — shown as a form-level error banner.
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch the property list once on mount so the select is ready immediately.
  const loadProperties = useCallback(async () => {
    setLoadingProperties(true);
    setPropertiesError(null);
    try {
      const list = await fetchProperties();
      setProperties(list);
    } catch {
      // Non-blocking: the user can still try to submit (backend will validate).
      setPropertiesError(
        "Unable to load the property list. Please refresh the page.",
      );
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  // Submits the form data to POST /issue-reports.
  // Returns the new report id on success so the caller can redirect.
  const submit = useCallback(
    async (values: CreateIssueReportRequest): Promise<string | null> => {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const created = await createIssueReport(values);
        return created.id;
      } catch (err) {
        if (axios.isAxiosError<ProblemDetailLike>(err)) {
          const status = err.response?.status;
          const data = err.response?.data;

          if (status === 400) {
            // Bean Validation errors include a per-field `errors` map.
            if (data?.errors) {
              const first = Object.values(data.errors)[0];
              setSubmitError(first ?? "Validation error. Check all fields.");
              return null;
            }
            // Domain error (e.g. property not in tenant).
            setSubmitError(
              data?.detail ?? "Invalid data. Please check the form.",
            );
            return null;
          }

          if (status === 404) {
            // Property UUID not found in this tenant.
            setSubmitError(
              "The selected property was not found. Please choose another.",
            );
            return null;
          }

          if (status === 401) {
            setSubmitError("Your session expired. Please sign in again.");
            return null;
          }
        }
        setSubmitError("Unable to submit the report. Please try again.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return {
    properties,
    loadingProperties,
    propertiesError,
    submitting,
    submitError,
    submit,
  };
}

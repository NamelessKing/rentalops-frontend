// usePropertyIssueReports.ts
// Loads all tenant issue reports and filters them by a specific propertyId.
//
// Why this hook exists:
//   The backend's GET /issue-reports endpoint returns all issue reports for
//   the current tenant without a propertyId query parameter. This hook does
//   the client-side filtering so PropertyIssueReportsPanel can show only
//   the reports relevant to the property currently being viewed.
//
//   This mirrors the pattern used by usePropertyTasks — same shape, same
//   rationale. Acceptable at MVP scale.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchIssueReports } from "../api/issueReportsApi";
import type { IssueReportListItem } from "../types";

// Fetches all issue reports and returns only those belonging to the given
// property. Returns { data, loading, error, reload } — the same shape used
// by other list hooks in this codebase.
export function usePropertyIssueReports(propertyId: string | undefined) {
  const [data, setData] = useState<IssueReportListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Skip the fetch when propertyId hasn't resolved yet (e.g. route param
    // is still undefined on the first render cycle).
    if (!propertyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const all = await fetchIssueReports();
      // Filter client-side — the backend has no ?propertyId query param.
      setData(all.filter((r) => r.propertyId === propertyId));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("You are not authorised to view issue reports.");
        } else {
          setError("Failed to load issue reports. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  // Run once when the hook mounts or when propertyId changes.
  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

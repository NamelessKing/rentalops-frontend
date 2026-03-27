// useAdminSummary.ts
// Manages loading and error lifecycle for the Admin dashboard summary call.
//
// Why this hook exists:
//   It centralises API orchestration so the page component can stay declarative
//   and only react to loading/error/empty/success states.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchAdminSummary } from "../api/dashboardApi";
import type { AdminDashboardSummary } from "../types";

// Encapsulates dashboard fetch state and exposes a reload function for retry UX.
export function useAdminSummary() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const summary = await fetchAdminSummary();
      setData(summary);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not authorised to view dashboard data.");
          return;
        }
      }

      setError("Unable to load dashboard data right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}

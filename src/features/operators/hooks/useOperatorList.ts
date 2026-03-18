// useOperatorList.ts
// Coordinates loading and error state for the Operator List page.
//
// Why this hook exists:
// Keep page components focused on rendering while this hook handles
// request lifecycle concerns (load, retry, and readable error messages).

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchOperators } from "../api/operatorsApi";
import type { OperatorListItem } from "../types";

export function useOperatorList() {
  const [data, setData] = useState<OperatorListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const operators = await fetchOperators();
      setData(operators);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view operators.");
          return;
        }
      }

      setError("Unable to load operators right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load immediately when the page mounts so users see data without extra clicks.
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

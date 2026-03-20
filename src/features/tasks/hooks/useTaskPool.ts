// useTaskPool.ts
// Manages loading and error state for the Operator Pool page (GET /tasks/pool).
//
// Why this hook exists:
// The backend applies the specializationCategory filter automatically.
// This hook just wraps the fetch and handles the standard loading/error cycle.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchTaskPool } from "../api/tasksApi";
import type { TaskPoolItem } from "../types";

export function useTaskPool() {
  const [data, setData] = useState<TaskPoolItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tasks = await fetchTaskPool();
      setData(tasks);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view the task pool.");
          return;
        }
      }

      setError("Unable to load the task pool right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

// useMyTasks.ts
// Manages loading and error state for the Operator My Tasks page (GET /tasks/my).
//
// Why this hook exists:
// Keeps the page component focused on rendering while this hook handles
// the request lifecycle.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchMyTasks } from "../api/tasksApi";
import type { MyTaskItem } from "../types";

export function useMyTasks() {
  const [data, setData] = useState<MyTaskItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tasks = await fetchMyTasks();
      setData(tasks);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view operator tasks.");
          return;
        }
      }

      setError("Unable to load your tasks right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

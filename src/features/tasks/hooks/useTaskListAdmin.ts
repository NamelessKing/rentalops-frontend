// useTaskListAdmin.ts
// Coordinates loading and error state for the Admin Task List page.
//
// Why this hook exists:
// Keeps the page component focused on rendering while this hook handles
// the request lifecycle.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchTasks } from "../api/tasksApi";
import type { TaskListItem } from "../types";

export function useTaskListAdmin() {
  const [data, setData] = useState<TaskListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tasks = await fetchTasks();
      setData(tasks);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view tasks.");
          return;
        }
      }

      setError("Unable to load tasks right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load immediately on mount so the user sees data without extra interaction.
  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

// usePropertyTasks.ts
// Loads all tenant tasks and filters them by a specific propertyId.
//
// Why this hook exists:
//   The backend's GET /tasks endpoint returns all tasks for the current tenant
//   without a propertyId query parameter. This hook does the filtering on the
//   client side so the PropertyTasksPanel can show only the tasks relevant to
//   the property currently being viewed.
//
//   This is acceptable for MVP scale. If the tenant grows very large, a
//   dedicated backend filter endpoint would be the next step.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchTasks } from "../api/tasksApi";
import type { TaskListItem } from "../types";

// Fetches all tasks and returns only those belonging to the given property.
// Returns { data, loading, error, reload } — same shape as other list hooks
// in this codebase so consumers can use a familiar pattern.
export function usePropertyTasks(propertyId: string | undefined) {
  const [data, setData] = useState<TaskListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // If we don't have a propertyId yet (e.g. route param not resolved),
    // skip the request to avoid a fetch with an undefined filter.
    if (!propertyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allTasks = await fetchTasks();

      // Filter client-side because GET /tasks has no propertyId query param.
      const forProperty = allTasks.filter((t) => t.propertyId === propertyId);
      setData(forProperty);
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
  }, [propertyId]);

  // Trigger the load whenever the hook mounts or the propertyId changes.
  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

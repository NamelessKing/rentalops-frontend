// useOperatorTasksOverview.ts
// Provides a unified task overview for a single operator: status counters
// and compact preview lists — all derived from one GET /tasks fetch.
//
// Why this hook exists:
//   EditOperatorPage previously used two hooks that each triggered GET /tasks
//   independently (one for counters, one for the task list). This hook replaces
//   both with a single fetch and derives everything in one pass, keeping the
//   network traffic to a minimum while giving the page all the data it needs.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchTasks } from "../api/tasksApi";
import type { TaskListItem } from "../types";

// Maximum task rows shown per status section in the UI panel.
// Kept small so the panel stays a summary, not a duplicate of the task list page.
const PREVIEW_LIMIT = 3;

// Counts across all statuses for this operator — used in section sub-headers
// so the Admin can see totals even when the preview is truncated.
export interface OperatorTaskCounts {
  inProgress: number;
  assigned: number;
  completed: number;
}

// Full shape returned by the hook once loading is complete.
export interface OperatorTasksOverview {
  // Totals before slicing — accurate even when the preview list is truncated.
  counts: OperatorTaskCounts;
  // Preview slices — already limited to PREVIEW_LIMIT items each.
  inProgressTasks: TaskListItem[];
  assignedTasks: TaskListItem[];
  completedTasks: TaskListItem[];
}

// Returns { overview, loading, error } for one operator.
// `overview` is null while loading or if the fetch failed.
export function useOperatorTasksOverview(operatorId: string) {
  const [overview, setOverview] = useState<OperatorTasksOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const all = await fetchTasks();

      // Filter to tasks owned by this specific operator.
      const mine = all.filter((t: TaskListItem) => t.assigneeId === operatorId);

      // Split into the three status buckets before slicing so counts stay accurate.
      const inProgressAll = mine.filter((t) => t.status === "IN_PROGRESS");
      const assignedAll = mine.filter((t) => t.status === "ASSIGNED");
      const completedAll = mine.filter((t) => t.status === "COMPLETED");

      setOverview({
        counts: {
          inProgress: inProgressAll.length,
          assigned: assignedAll.length,
          completed: completedAll.length,
        },
        // Slice after counting — ensures the sub-header total reflects all tasks,
        // not just what fits in the preview.
        inProgressTasks: inProgressAll.slice(0, PREVIEW_LIMIT),
        assignedTasks: assignedAll.slice(0, PREVIEW_LIMIT),
        completedTasks: completedAll.slice(0, PREVIEW_LIMIT),
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Session expired.");
          return;
        }

        if (status === 403) {
          setError("Not allowed.");
          return;
        }
      }

      setError("Could not load task overview.");
    } finally {
      setLoading(false);
    }
  }, [operatorId]);

  // Guard against blank operatorId — the URL param may be undefined on first render.
  useEffect(() => {
    if (operatorId) void load();
  }, [operatorId, load]);

  return { overview, loading, error };
}

// useOperatorsWorkloadMap.ts
// Builds a per-operator workload map from the tenant task list.
//
// Why this hook exists:
//   OperatorListPage needs quick workload signals for many operators at once.
//   Fetching once and aggregating client-side avoids one request per row.

import { useEffect, useState } from "react";
import axios from "axios";
import { fetchTasks } from "../api/tasksApi";

interface OperatorWorkloadCounts {
  assigned: number;
  inProgress: number;
  completed: number;
}

type OperatorsWorkloadMap = Record<string, OperatorWorkloadCounts>;

// Loads all tasks once and returns counters grouped by assignee id.
// The page can render workload badges as a secondary signal without blocking core data.
export function useOperatorsWorkloadMap() {
  const [workloadByOperatorId, setWorkloadByOperatorId] =
    useState<OperatorsWorkloadMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const tasks = await fetchTasks();
        const next: OperatorsWorkloadMap = {};

        for (const task of tasks) {
          // Pool tasks have no assignee and are not part of per-operator workload.
          if (!task.assigneeId) continue;

          if (!next[task.assigneeId]) {
            next[task.assigneeId] = {
              assigned: 0,
              inProgress: 0,
              completed: 0,
            };
          }

          if (task.status === "ASSIGNED") {
            next[task.assigneeId].assigned += 1;
          } else if (task.status === "IN_PROGRESS") {
            next[task.assigneeId].inProgress += 1;
          } else if (task.status === "COMPLETED") {
            next[task.assigneeId].completed += 1;
          }
        }

        if (isMounted) {
          setWorkloadByOperatorId(next);
        }
      } catch (err) {
        if (isMounted) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            setError("Workload unavailable (session expired).");
          } else {
            setError("Workload badges unavailable right now.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { workloadByOperatorId, loading, error };
}

// useTaskDetail.ts
// Fetches and manages state for a single task's full detail.
//
// Why this hook is shared between Admin and Operator detail pages:
// Both call GET /tasks/{id} and receive the same TaskDetailResponse shape.
// The pages themselves decide which CTAs to render based on their role context.
// Sharing prevents duplicating identical loading/error logic.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchTask } from "../api/tasksApi";
import type { TaskDetailResponse } from "../types";

export function useTaskDetail(taskId: string | undefined) {
  const [data, setData] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Guard: taskId comes from route params and should always be defined,
    // but we check defensively to avoid an unnecessary API call on edge cases.
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const task = await fetchTask(taskId);
      setData(task);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        // 403 is important for Operators: they receive this when the task
        // exists but belongs to another operator. Show a clear message.
        if (status === 403) {
          setError("You are not assigned to this task.");
          return;
        }

        if (status === 404) {
          setError("Task not found.");
          return;
        }
      }

      setError("Unable to load task details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

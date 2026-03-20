// useCreateTask.ts
// Manages support data loading (properties + operators) and the create-task submit action.
//
// Why this hook owns both responsibilities:
// The Create Task form needs both lists to render its selects before the user
// can interact. Keeping them together means one hook to consume, one loading
// state to check, and one place to handle support-data errors.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchProperties } from "@/features/properties/api/propertiesApi";
import { fetchOperators } from "@/features/operators/api/operatorsApi";
import type { PropertyListItem } from "@/features/properties/types";
import type { OperatorListItem } from "@/features/operators/types";
import { createTask } from "../api/tasksApi";
import type { CreateTaskRequest, TaskDetailResponse } from "../types";

// ProblemDetail shape returned by this backend (RFC 7807).
interface ProblemDetailLike {
  detail?: string;
  errors?: Record<string, string>; // Present on Bean Validation 400 responses.
}

export function useCreateTask() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [operators, setOperators] = useState<OperatorListItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadDataError, setLoadDataError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch both lists in parallel — neither depends on the other.
  const loadSupportData = useCallback(async () => {
    setLoadingData(true);
    setLoadDataError(null);

    try {
      const [props, ops] = await Promise.all([
        fetchProperties(),
        fetchOperators(),
      ]);
      setProperties(props);
      setOperators(ops);
    } catch {
      setLoadDataError(
        "Unable to load form data (properties / operators). Please reload.",
      );
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadSupportData();
  }, [loadSupportData]);

  const submit = useCallback(
    async (values: CreateTaskRequest): Promise<TaskDetailResponse | null> => {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const created = await createTask(values);
        return created;
      } catch (err) {
        if (axios.isAxiosError<ProblemDetailLike>(err)) {
          const status = err.response?.status;
          const data = err.response?.data;

          if (status === 400) {
            // Bean Validation errors include a per-field `errors` map.
            // Extract the first message for a concise banner.
            if (data?.errors) {
              const firstMessage = Object.values(data.errors)[0];
              setSubmitError(
                firstMessage ?? "Validation error. Check all required fields.",
              );
              return null;
            }
            // Domain validation (e.g. POOL with assigneeId present, or DIRECT without).
            setSubmitError(
              data?.detail ?? "Validation error. Check all required fields.",
            );
            return null;
          }

          if (status === 401) {
            setSubmitError("Your session expired. Please sign in again.");
            return null;
          }

          if (status === 403) {
            setSubmitError("Only admins can create tasks.");
            return null;
          }

          if (status === 404) {
            setSubmitError(
              data?.detail ??
                "Property or operator not found in this workspace.",
            );
            return null;
          }

          if (status === 409) {
            setSubmitError(
              data?.detail ?? "The selected user is not an operator.",
            );
            return null;
          }
        }

        setSubmitError(
          "Unexpected error while creating task. Please try again.",
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return {
    properties,
    operators,
    loadingData,
    loadDataError,
    submitting,
    submitError,
    submit,
  };
}

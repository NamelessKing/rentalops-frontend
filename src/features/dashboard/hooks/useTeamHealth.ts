// useTeamHealth.ts
// Loads and derives Team Health metrics for the Admin dashboard panel.
//
// Why this hook exists:
//   The panel needs operator-specific metrics from an existing endpoint,
//   while keeping API and transformation logic outside the page component.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchOperators } from "@/features/operators/api/operatorsApi";
import type {
  OperatorListItem,
  SpecializationCategory,
} from "@/features/operators/types";

export interface TeamHealthMetrics {
  activeOperators: number;
  disabledOperators: number;
  specializationBreakdown: Record<SpecializationCategory, number>;
}

function createEmptySpecializationBreakdown(): Record<
  SpecializationCategory,
  number
> {
  // Keep all categories present even when count is zero, so the UI stays stable.
  return {
    CLEANING: 0,
    PLUMBING: 0,
    ELECTRICAL: 0,
    GENERAL_MAINTENANCE: 0,
  };
}

function buildTeamHealthMetrics(
  operators: OperatorListItem[],
): TeamHealthMetrics {
  const specializationBreakdown = createEmptySpecializationBreakdown();
  let activeOperators = 0;
  let disabledOperators = 0;

  operators.forEach((operator) => {
    if (operator.status === "ACTIVE") {
      activeOperators += 1;
    } else {
      disabledOperators += 1;
    }

    specializationBreakdown[operator.specializationCategory] += 1;
  });

  return {
    activeOperators,
    disabledOperators,
    specializationBreakdown,
  };
}

// Fetches Team Health data for the dashboard and exposes a retry action.
export function useTeamHealth() {
  const [data, setData] = useState<TeamHealthMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const operators = await fetchOperators();
      setData(buildTeamHealthMetrics(operators));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view team health data.");
          return;
        }
      }

      setError("Unable to load team health right now. Please try again.");
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

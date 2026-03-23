// useIssueReportDetail.ts
// Manages loading state for a single issue report detail, plus the convert and
// dismiss actions that the Admin can take on an OPEN report.
//
// Why all three actions live in one hook:
//   The detail page needs the report data, and both actions mutate that report's
//   state. Keeping them together means one place to handle reload after a 409,
//   and the page component stays focused on rendering decisions.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  convertIssueReport,
  dismissIssueReport,
  fetchIssueReport,
} from "../api/issueReportsApi";
import { fetchOperators } from "@/features/operators/api/operatorsApi";
import type { ConvertIssueReportRequest, IssueReportDetail } from "../types";
import type { OperatorListItem } from "@/features/operators/types";

// ProblemDetail shape returned by this backend (RFC 7807).
interface ProblemDetailLike {
  detail?: string;
  errors?: Record<string, string>;
}

export function useIssueReportDetail(reportId: string | undefined) {
  const [data, setData] = useState<IssueReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operators list — loaded once and used by the convert form's assignee select.
  const [operators, setOperators] = useState<OperatorListItem[]>([]);

  // True while a convert or dismiss action is in flight.
  const [acting, setActing] = useState(false);
  // Set when a convert or dismiss action fails — shown as a form-level banner.
  const [actionError, setActionError] = useState<string | null>(null);
  // Toast-style success message after a successful action.
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetches the report detail and the operators list in parallel on mount.
  const load = useCallback(async () => {
    if (!reportId) return;

    setLoading(true);
    setError(null);

    try {
      // Load report and operators in parallel — both are needed before the
      // page can render the form fields.
      const [report, ops] = await Promise.all([
        fetchIssueReport(reportId),
        fetchOperators(),
      ]);
      setData(report);
      setOperators(ops);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }
        if (status === 403) {
          setError("You are not authorised to view this report.");
          return;
        }
        if (status === 404) {
          setError("Issue report not found.");
          return;
        }
      }
      setError("Unable to load the issue report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Converts the report to a task. Returns the created task id on success,
  // null on failure (so the page can decide what to do next).
  const convert = useCallback(
    async (
      payload: ConvertIssueReportRequest,
    ): Promise<{ taskId: string } | null> => {
      if (!reportId) return null;

      setActing(true);
      setActionError(null);
      setActionSuccess(null);

      try {
        const res = await convertIssueReport(reportId, payload);
        // Update local report state immediately so the CTAs disappear without
        // needing a full reload.
        setData((prev) => (prev ? { ...prev, status: "CONVERTED" } : prev));
        setActionSuccess(
          "Report converted successfully. A new task has been created.",
        );
        return { taskId: res.task.id };
      } catch (err) {
        if (axios.isAxiosError<ProblemDetailLike>(err)) {
          const status = err.response?.status;
          const data = err.response?.data;

          if (status === 409) {
            // Someone else already reviewed this report — reload to show current state.
            setActionError(
              "This report has already been reviewed. Reloading the latest status.",
            );
            void load();
            return null;
          }
          if (status === 400) {
            if (data?.errors) {
              const first = Object.values(data.errors)[0];
              setActionError(first ?? "Validation error. Check all fields.");
              return null;
            }
            setActionError(
              data?.detail ?? "Invalid form data. Please check all fields.",
            );
            return null;
          }
          if (status === 401) {
            setActionError("Your session expired. Please sign in again.");
            return null;
          }
        }
        setActionError("Unable to convert the report. Please try again.");
        return null;
      } finally {
        setActing(false);
      }
    },
    [reportId, load],
  );

  // Dismisses the report. Returns true on success, false on failure.
  const dismiss = useCallback(async (): Promise<boolean> => {
    if (!reportId) return false;

    setActing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await dismissIssueReport(reportId);
      // Update local state immediately — no reload needed.
      setData((prev) => (prev ? { ...prev, status: "DISMISSED" } : prev));
      setActionSuccess("Report archived successfully.");
      return true;
    } catch (err) {
      if (axios.isAxiosError<ProblemDetailLike>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 409) {
          setActionError(
            "This report has already been reviewed. Reloading the latest status.",
          );
          void load();
          return false;
        }
        if (status === 404) {
          setActionError("Report not found.");
          return false;
        }
        if (status === 401) {
          setActionError("Your session expired. Please sign in again.");
          return false;
        }
        setActionError(data?.detail ?? "Unable to archive the report.");
        return false;
      }
      setActionError("Unable to archive the report. Please try again.");
      return false;
    } finally {
      setActing(false);
    }
  }, [reportId, load]);

  return {
    data,
    loading,
    error,
    reload: load,
    operators,
    acting,
    actionError,
    actionSuccess,
    convert,
    dismiss,
    clearActionMessages: () => {
      setActionError(null);
      setActionSuccess(null);
    },
  };
}

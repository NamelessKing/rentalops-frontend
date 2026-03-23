// useIssueReportList.ts
// Coordinates loading, error state, and inline dismiss for the Admin Issue Report List page.
//
// Why this hook exists:
//   Keeps the page component focused on rendering while this hook handles
//   the request lifecycle — same pattern as useTaskListAdmin.ts.
//
// Added in GAP-1 fix:
//   dismiss(id)  — calls PATCH /issue-reports/{id}/dismiss
//   dismissingId — tracks which row is currently being dismissed (for spinner)
//   rowErrors    — per-row inline error messages keyed by report id

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { dismissIssueReport, fetchIssueReports } from "../api/issueReportsApi";
import type { IssueReportListItem } from "../types";

export function useIssueReportList() {
  const [data, setData] = useState<IssueReportListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks which row's Dismiss button is currently spinning.
  // Only one dismiss can be in-flight at a time per UX design.
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Per-row error messages shown inline below the action buttons.
  // Keyed by issue report id so each row owns its own error state.
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reports = await fetchIssueReports();
      setData(reports);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not authorised to view issue reports.");
          return;
        }
      }

      setError("Unable to load issue reports right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Dismisses a single issue report inline from the list.
  // On success the list is reloaded so the row status updates from the server.
  // On 409 (already reviewed by someone else) we show a conflict message and
  // still reload so the user sees the current server state immediately.
  const dismiss = useCallback(
    async (id: string) => {
      setDismissingId(id);

      // Clear any previous error for this row before the new attempt.
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      try {
        await dismissIssueReport(id);
        // Reload the full list so the row's status updates from the server.
        await load();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          // 409 means another admin already reviewed this report before us.
          // Show a friendly conflict message and reload to reflect server state.
          setRowErrors((prev) => ({
            ...prev,
            [id]: "This report was already reviewed. Refreshing the list\u2026",
          }));
          await load();
          return;
        }

        // Any other error — show a generic message, leave the row as-is.
        setRowErrors((prev) => ({
          ...prev,
          [id]: "Unable to dismiss. Please try again.",
        }));
      } finally {
        // Always clear the spinner, regardless of outcome.
        setDismissingId(null);
      }
    },
    [load],
  );

  return {
    data,
    loading,
    error,
    reload: load,
    dismiss,
    dismissingId,
    rowErrors,
  };
}

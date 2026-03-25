// useRecentOpenIssueReports.ts
// Loads a compact set of recent OPEN issue reports for the dashboard preview panel.
//
// Why this hook exists:
//   The dashboard needs a focused, operational preview without pulling
//   issue-report list logic into the page component.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchIssueReports } from "@/features/issueReports/api/issueReportsApi";
import type { IssueReportListItem } from "@/features/issueReports/types";

const RECENT_OPEN_LIMIT = 5;

export interface RecentOpenIssueReportItem {
  id: string;
  propertyName: string;
  reportedByUserName: string;
  description: string;
  createdAt: string;
}

function buildRecentOpenReports(
  reports: IssueReportListItem[],
): RecentOpenIssueReportItem[] {
  // Keep only unresolved reports and cap the panel to a small, actionable set.
  return reports
    .filter((report) => report.status === "OPEN")
    .slice(0, RECENT_OPEN_LIMIT)
    .map((report) => ({
      id: report.id,
      propertyName: report.propertyName,
      reportedByUserName: report.reportedByUserName,
      description: report.description,
      createdAt: report.createdAt,
    }));
}

// Fetches recent OPEN issue reports and exposes a retry action for panel-level recovery.
export function useRecentOpenIssueReports() {
  const [data, setData] = useState<RecentOpenIssueReportItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reports = await fetchIssueReports();
      setData(buildRecentOpenReports(reports));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not authorised to view open issue reports.");
          return;
        }
      }

      setError(
        "Unable to load open issue reports right now. Please try again.",
      );
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

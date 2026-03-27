// PropertyIssueReportsPanel.tsx
// A compact, read-only panel that shows issue reports linked to a specific
// property, grouped by status so the Admin can spot open items quickly.
//
// Why this component exists:
//   The property detail page already shows tasks via PropertyTasksPanel.
//   This companion panel adds reporting context — the Admin sees at a glance
//   how many open, converted, or dismissed reports exist for this property
//   without navigating away.
//
//   It fetches all tenant issue reports and filters by propertyId on the
//   client side, matching the same approach used for PropertyTasksPanel.
//
// Visual language:
//   Mirrors PropertyTasksPanel and the Task Overview on EditOperatorPage:
//   tinted section blocks, 3-row rows, and semantic section title colours.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePropertyIssueReports } from "@/features/issueReports/hooks/usePropertyIssueReports";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { IssueReportListItem } from "@/features/issueReports/types";

interface PropertyIssueReportsPanelProps {
  propertyId: string;
}

// How many issue reports to show per status section before showing the
// overflow hint. Kept small so the panel stays a summary.
const PREVIEW_LIMIT = 3;

// Formats an ISO 8601 date string to a short, locale-aware date.
// Using "short" month avoids locale-specific ordering confusion.
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Renders a compact 3-row list for a single status section.
// Row layout:
//   1. Reporter name (left) + CTA button (right)
//   2. Description preview (truncated to 120 chars)
//   3. Status badge + formatted date
//
// CTA is "Review" for OPEN reports (they need admin action) and "View"
// for CONVERTED or DISMISSED (read-only context). Both link to the detail/
// convert route, which is the single admin route for issue report detail.
function IssueReportRows({
  reports,
  total,
}: {
  reports: IssueReportListItem[];
  total: number;
}) {
  return (
    <ul className="list-unstyled mb-0">
      {reports.map((report, idx) => {
        // Truncate long descriptions so the panel stays compact.
        const descPreview =
          report.description.length > 120
            ? report.description.slice(0, 120) + "…"
            : report.description;

        // OPEN reports still need a decision — label them "Review" to signal
        // that action is possible. Closed reports get a neutral "View".
        const ctaLabel = report.status === "OPEN" ? "Review" : "View";

        return (
          <li
            key={report.id}
            className={
              idx < reports.length - 1 ? "border-bottom pb-3 mb-3" : ""
            }
          >
            {/* Top row: who reported it + quick action. */}
            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
              <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                <i className="bi bi-person me-1" aria-hidden="true" />
                {report.reportedByUserName}
              </p>
              <Link
                to={`/admin/issue-reports/${report.id}/convert`}
                className="btn btn-outline-primary btn-sm flex-shrink-0"
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
              >
                {ctaLabel}
              </Link>
            </div>

            {/* Description preview stays on its own row for readability. */}
            <p
              className="mb-2 fw-medium"
              style={{ fontSize: "0.9rem", lineHeight: 1.35 }}
            >
              {descPreview}
            </p>

            {/* Bottom row: status badge + creation date. */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <StatusBadge status={report.status} type="issueReport" />
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                {formatDate(report.createdAt)}
              </span>
            </div>
          </li>
        );
      })}

      {/* Overflow hint — only shown when the bucket has more items than the
          preview limit. Lives inside <ul> as a <li> to keep markup consistent
          with PropertyTasksPanel's overflow pattern. */}
      {total > reports.length && (
        <li className="mt-2">
          <p className="text-muted small mb-0">
            Showing {reports.length} of {total}
          </p>
        </li>
      )}
    </ul>
  );
}

// Shows property issue reports grouped by status: Open, Converted, Dismissed.
// Only sections with at least one report are rendered.
// Reports within each bucket are sorted newest-first before slicing.
// Handles loading, error, empty, and success states explicitly.
export function PropertyIssueReportsPanel({
  propertyId,
}: PropertyIssueReportsPanelProps) {
  const { data, loading, error, reload } = usePropertyIssueReports(propertyId);

  // Derive status buckets from the flat list.
  // Reports are sorted descending by createdAt so the most recent items
  // appear first in each preview, giving the Admin the most actionable view.
  const buckets = useMemo(() => {
    if (!data) {
      return null;
    }

    const byDateDesc = [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const openAll = byDateDesc.filter((r) => r.status === "OPEN");
    const convertedAll = byDateDesc.filter((r) => r.status === "CONVERTED");
    const dismissedAll = byDateDesc.filter((r) => r.status === "DISMISSED");

    return {
      open: { total: openAll.length, preview: openAll.slice(0, PREVIEW_LIMIT) },
      converted: {
        total: convertedAll.length,
        preview: convertedAll.slice(0, PREVIEW_LIMIT),
      },
      dismissed: {
        total: dismissedAll.length,
        preview: dismissedAll.slice(0, PREVIEW_LIMIT),
      },
    };
  }, [data]);

  // True when data is loaded and all buckets are empty.
  const isEmpty =
    buckets !== null &&
    buckets.open.total === 0 &&
    buckets.converted.total === 0 &&
    buckets.dismissed.total === 0;

  return (
    <div className="ro-section-panel mt-3">
      <div className="ro-section-panel-header">Issue Reports</div>
      <div className="p-3">
        {loading && (
          <p className="text-muted small mb-0">Loading issue reports…</p>
        )}

        {!loading && error && (
          <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0 py-2">
            <span className="small">{error}</span>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => void reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <p className="text-muted small mb-0">
            No issue reports for this property yet.
          </p>
        )}

        {!loading && !error && buckets !== null && !isEmpty && (
          // Each section block is only rendered when its bucket has reports.
          <div>
            {/* Open section — amber title signals reports needing admin action. */}
            {buckets.open.total > 0 && (
              <div
                className="mb-3 p-3 rounded-3 border"
                style={{
                  backgroundColor: "var(--ro-bg)",
                  borderColor: "var(--ro-border)",
                }}
              >
                <p
                  className="small fw-semibold mb-3"
                  style={{
                    color: "var(--ro-warning)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Open ({buckets.open.total})
                </p>
                <IssueReportRows
                  reports={buckets.open.preview}
                  total={buckets.open.total}
                />
              </div>
            )}

            {/* Converted section — green title, reports turned into tasks. */}
            {buckets.converted.total > 0 && (
              <div
                className="mb-3 p-3 rounded-3 border"
                style={{
                  backgroundColor: "var(--ro-bg)",
                  borderColor: "var(--ro-border)",
                }}
              >
                <p
                  className="small fw-semibold mb-3"
                  style={{
                    color: "var(--ro-success)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Converted ({buckets.converted.total})
                </p>
                <IssueReportRows
                  reports={buckets.converted.preview}
                  total={buckets.converted.total}
                />
              </div>
            )}

            {/* Dismissed section — neutral title, reports closed without action. */}
            {buckets.dismissed.total > 0 && (
              <div
                className="p-3 rounded-3 border"
                style={{
                  backgroundColor: "var(--ro-bg)",
                  borderColor: "var(--ro-border)",
                }}
              >
                <p
                  className="small fw-semibold mb-3"
                  style={{ letterSpacing: "0.02em" }}
                >
                  Dismissed ({buckets.dismissed.total})
                </p>
                <IssueReportRows
                  reports={buckets.dismissed.preview}
                  total={buckets.dismissed.total}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

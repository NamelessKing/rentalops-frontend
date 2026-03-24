// IssueReportListAdminPage.tsx
// Admin view — lists all issue reports for the current tenant.
//
// Route:     /admin/issue-reports
// Role:      ADMIN only (enforced by RequireRole in the router)
// Endpoints:
//   GET /issue-reports         — load the list
//   PATCH /issue-reports/{id}/dismiss — inline dismiss per-row (OPEN only)
//
// The list is ordered by createdAt descending (server-side — most recent first).
// Three states are shown with distinct visual treatment:
//   OPEN      — yellow badge + "Review" Link + "Dismiss" button
//   CONVERTED — green badge, "View" Link only (already handled)
//   DISMISSED — muted grey badge, "View" Link only (archived)
//
// Layout uses the two-tier mobile-first pattern from the design system:
//   - Card stack on mobile (always readable)
//   - Table on medium+ viewports (density for admins at a desk)

import React from "react";
import { Link } from "react-router-dom";
import { useIssueReportList } from "@/features/issueReports/hooks/useIssueReportList";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import type { IssueReportListItem } from "@/features/issueReports/types";

// Formats an ISO 8601 datetime string into a concise locale string.
// Supports both legacy timezone-less values and the newer UTC values with "Z".
// This avoids generating invalid timestamps like "...ZZ" during the migration window.
function formatDate(iso: string): string {
  const normalizedIso = /(?:Z|[+-]\d{2}:\d{2})$/i.test(iso) ? iso : `${iso}Z`;

  return new Date(normalizedIso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function IssueReportListAdminPage() {
  // dismiss, dismissingId, rowErrors are the new additions for GAP-1.
  const { data, loading, error, reload, dismiss, dismissingId, rowErrors } =
    useIssueReportList();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="ro-page-content" aria-live="polite">
        <PageHeader title="Issue Reports" />
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </section>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="ro-page-content">
        <PageHeader title="Issue Reports" />
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={reload}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const reports = data ?? [];

  // ── Empty state ────────────────────────────────────────────────────────────
  if (reports.length === 0) {
    return (
      <section className="ro-page-content">
        <PageHeader title="Issue Reports" />
        <EmptyState
          icon="bi-flag"
          title="No issue reports yet."
          message="When operators report problems from the field, they will appear here."
        />
      </section>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <section className="ro-page-content">
      <PageHeader
        title="Issue Reports"
        subtitle={`${reports.length} report${reports.length !== 1 ? "s" : ""} — most recent first`}
      />

      {/* ── Mobile card stack (visible on xs/sm) ── */}
      <div className="d-md-none d-flex flex-column gap-3">
        {reports.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            dismiss={dismiss}
            dismissingId={dismissingId}
            rowErrors={rowErrors}
          />
        ))}
      </div>

      {/* ── Desktop table (visible on md+) ── */}
      <div className="ro-section-panel d-none d-md-block">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Property</th>
              <th>Reported by</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
              <th>{/* actions column — no header text */}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              // React.Fragment (long-form) is required here because the key prop
              // must sit on the outermost element, and <> shorthand cannot carry props.
              <React.Fragment key={r.id}>
                <tr>
                  <td className="align-middle fw-medium">{r.propertyName}</td>
                  <td className="align-middle text-muted small">
                    {r.reportedByUserName}
                  </td>
                  {/* Truncate long descriptions with a fixed max width so the
                      table stays readable — full text is on the detail page. */}
                  <td
                    className="align-middle small"
                    style={{
                      maxWidth: 260,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.description}
                  >
                    {r.description}
                  </td>
                  <td className="align-middle">
                    <StatusBadge status={r.status} type="issueReport" />
                  </td>
                  <td className="align-middle text-muted small text-nowrap">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="align-middle text-end text-nowrap">
                    {r.status === "OPEN" ? (
                      // OPEN reports: show "Review" (navigate to convert page)
                      // and an inline "Dismiss" button.
                      <>
                        <Link
                          to={`/admin/issue-reports/${r.id}/convert`}
                          className="btn btn-sm btn-primary"
                        >
                          Review
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger ms-1"
                          disabled={dismissingId === r.id}
                          onClick={() => void dismiss(r.id)}
                          aria-label={`Dismiss report for ${r.propertyName}`}
                        >
                          {dismissingId === r.id ? (
                            // Show a tiny inline spinner while the PATCH is in-flight.
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              />
                              Dismissing…
                            </>
                          ) : (
                            "Dismiss"
                          )}
                        </button>
                      </>
                    ) : (
                      // CONVERTED and DISMISSED: read-only view link only.
                      <Link
                        to={`/admin/issue-reports/${r.id}/convert`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
                {/* Inline error row — only visible when a dismiss for this row failed. */}
                {rowErrors[r.id] && (
                  <tr>
                    <td
                      colSpan={6}
                      className="pt-0 pb-1 border-top-0 text-danger small"
                    >
                      <i
                        className="bi bi-exclamation-circle me-1"
                        aria-hidden="true"
                      />
                      {rowErrors[r.id]}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── ReportCard ──────────────────────────────────────────────────────────────
// Mobile card for one issue report row.
// For OPEN reports it shows both a "Review" Link and a "Dismiss" button.
interface ReportCardProps {
  report: IssueReportListItem;
  dismiss: (id: string) => Promise<void>;
  dismissingId: string | null;
  rowErrors: Record<string, string>;
}

function ReportCard({
  report: r,
  dismiss,
  dismissingId,
  rowErrors,
}: ReportCardProps) {
  return (
    <div className="ro-task-card">
      <div className="card-body">
        {/* Header row: property name + status badge */}
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="fw-semibold">{r.propertyName}</span>
          <StatusBadge status={r.status} type="issueReport" />
        </div>

        {/* Reporter and date */}
        <p className="text-muted small mb-1">
          <i className="bi bi-person me-1" aria-hidden="true" />
          {r.reportedByUserName} &middot; {formatDate(r.createdAt)}
        </p>

        {/* Description preview — capped at two lines via CSS line-clamp */}
        <p
          className="small mb-0"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {r.description}
        </p>

        {/* Inline error message for this card's dismiss action */}
        {rowErrors[r.id] && (
          <p className="text-danger small mt-1 mb-0">
            <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
            {rowErrors[r.id]}
          </p>
        )}
      </div>

      {/* Footer CTA — for OPEN reports: Review + Dismiss side-by-side */}
      <div className="card-footer bg-transparent border-top-0 pt-0">
        {r.status === "OPEN" ? (
          <div className="d-grid gap-2">
            <Link
              to={`/admin/issue-reports/${r.id}/convert`}
              className="btn btn-sm btn-primary"
            >
              Review
            </Link>
            <button
              className="btn btn-sm btn-outline-danger"
              disabled={dismissingId === r.id}
              onClick={() => void dismiss(r.id)}
              aria-label={`Dismiss report for ${r.propertyName}`}
            >
              {dismissingId === r.id ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />
                  Dismissing…
                </>
              ) : (
                "Dismiss"
              )}
            </button>
          </div>
        ) : (
          <Link
            to={`/admin/issue-reports/${r.id}/convert`}
            className="btn btn-sm w-100 btn-outline-secondary"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}

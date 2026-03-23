// IssueReportDetailAdminPage.tsx
// Admin view — full detail of one issue report, with convert and dismiss actions.
//
// Route:     /admin/issue-reports/:issueReportId
// Role:      ADMIN only (enforced by RequireRole in the router)
// Endpoints:
//   GET    /issue-reports/{id}                  — load detail
//   PATCH  /issue-reports/{id}/convert-to-task  — convert OPEN → CONVERTED
//   PATCH  /issue-reports/{id}/dismiss          — archive OPEN → DISMISSED
//   GET    /users/operators                      — populate assignee select (via hook)
//
// CTA logic (from SLICE5_FRONTEND_HANDOFF.md):
//   status === "OPEN"       → show "Convert to Task" form + "Dismiss" button
//   status !== "OPEN"       → show read-only review result, no CTAs
//
// Convert form business rules:
//   - dispatchMode POOL            → assigneeId must be hidden and NOT sent
//   - dispatchMode DIRECT_ASSIGNMENT → assigneeId required, filter by category
//   - propertyId is NOT in the body (inherited from the report server-side)
//
// 409 handling: if another Admin reviewed the report while the form was open,
// the hook reloads the detail so the UI reflects the current server state.

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useIssueReportDetail } from "@/features/issueReports/hooks/useIssueReportDetail";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PageHeader } from "@/shared/components/PageHeader";
import type {
  ConvertIssueReportRequest,
  IssueReportDetail,
} from "@/features/issueReports/types";
import type { OperatorListItem } from "@/features/operators/types";
import type {
  TaskCategory,
  TaskDispatchMode,
  TaskPriority,
} from "@/features/tasks/types";

// ── Option lists ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: Array<{ value: TaskCategory; label: string }> = [
  { value: "CLEANING", label: "Cleaning" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "GENERAL_MAINTENANCE", label: "General Maintenance" },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

// Formats an ISO 8601 datetime string to a human-readable local string.
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "Z").toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function IssueReportDetailAdminPage() {
  const { issueReportId } = useParams<{ issueReportId: string }>();
  const navigate = useNavigate();

  const {
    data: report,
    loading,
    error,
    reload,
    operators,
    acting,
    actionError,
    actionSuccess,
    convert,
    dismiss,
    clearActionMessages,
  } = useIssueReportDetail(issueReportId);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="ro-page-content" aria-live="polite">
        <PageHeader title="Issue Report" />
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </section>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="ro-page-content">
        <PageHeader title="Issue Report" />
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
        <Link
          to="/admin/issue-reports"
          className="btn btn-outline-secondary btn-sm mt-2"
        >
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Back to Issue Reports
        </Link>
      </section>
    );
  }

  if (!report) return null;

  return (
    <section className="ro-page-content">
      <PageHeader
        title="Issue Report"
        subtitle={`#${report.id.slice(0, 8).toUpperCase()}`}
        action={
          <Link
            to="/admin/issue-reports"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Back to List
          </Link>
        }
      />

      {/* Action feedback banners */}
      {actionSuccess && (
        <div
          className="alert alert-success alert-dismissible mb-3"
          role="alert"
        >
          <i className="bi bi-check-circle me-2" aria-hidden="true" />
          {actionSuccess}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={clearActionMessages}
          />
        </div>
      )}
      {actionError && (
        <div className="alert alert-danger alert-dismissible mb-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          {actionError}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={clearActionMessages}
          />
        </div>
      )}

      {/* ── Report detail panel ── */}
      <ReportDetailPanel report={report} />

      {/* ── Admin actions — only shown for OPEN reports ── */}
      {report.status === "OPEN" && (
        <OpenReportActions
          operators={operators}
          acting={acting}
          onConvert={async (payload) => {
            const result = await convert(payload);
            // After a successful convert, navigate to the newly created task.
            if (result) {
              navigate(`/admin/tasks/${result.taskId}`);
            }
          }}
          onDismiss={dismiss}
        />
      )}

      {/* ── Review result — shown for already-reviewed reports ── */}
      {report.status !== "OPEN" && <ReviewedPanel report={report} />}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReportDetailPanel — read-only detail fields for any report status
// ─────────────────────────────────────────────────────────────────────────────

function ReportDetailPanel({ report }: { report: IssueReportDetail }) {
  return (
    <div className="ro-section-panel p-3 mb-4">
      <dl className="mb-0">
        <div className="dl-row">
          <dt>Status</dt>
          <dd>
            <StatusBadge status={report.status} type="issueReport" />
          </dd>
        </div>
        <div className="dl-row">
          <dt>Property</dt>
          <dd>{report.propertyName}</dd>
        </div>
        <div className="dl-row">
          <dt>Reported by</dt>
          <dd>{report.reportedByUserName}</dd>
        </div>
        <div className="dl-row">
          <dt>Date reported</dt>
          <dd>{formatDate(report.createdAt)}</dd>
        </div>
        <div className="dl-row">
          <dt>Description</dt>
          {/* Pre-wrap preserves newlines the operator may have typed */}
          <dd style={{ whiteSpace: "pre-wrap" }}>{report.description}</dd>
        </div>
      </dl>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReviewedPanel — shown when report is CONVERTED or DISMISSED
// ─────────────────────────────────────────────────────────────────────────────

function ReviewedPanel({ report }: { report: IssueReportDetail }) {
  return (
    <div className="ro-section-panel p-3 mb-4">
      <p
        className="text-muted small mb-2 fw-semibold text-uppercase"
        style={{ letterSpacing: "0.05em" }}
      >
        Review Result
      </p>
      <dl className="mb-0">
        <div className="dl-row">
          <dt>Reviewed at</dt>
          <dd>{formatDate(report.reviewedAt)}</dd>
        </div>
        {report.status === "CONVERTED" && (
          <div className="dl-row">
            <dt>Outcome</dt>
            <dd>
              <span className="text-success fw-medium">
                <i className="bi bi-check-circle me-1" aria-hidden="true" />
                Converted to task
              </span>
            </dd>
          </div>
        )}
        {report.status === "DISMISSED" && (
          <div className="dl-row">
            <dt>Outcome</dt>
            <dd>
              <span className="text-muted fst-italic">
                <i className="bi bi-archive me-1" aria-hidden="true" />
                Archived without action
              </span>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenReportActions — convert form + dismiss for OPEN reports
// ─────────────────────────────────────────────────────────────────────────────

interface OpenReportActionsProps {
  operators: OperatorListItem[];
  acting: boolean;
  onConvert: (payload: ConvertIssueReportRequest) => Promise<void>;
  onDismiss: () => Promise<boolean>;
}

function OpenReportActions({
  operators,
  acting,
  onConvert,
  onDismiss,
}: OpenReportActionsProps) {
  // Convert form local state.
  const [category, setCategory] = useState<TaskCategory>("CLEANING");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [summary, setSummary] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dispatchMode, setDispatchMode] = useState<TaskDispatchMode>("POOL");
  const [assigneeId, setAssigneeId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  // Client-side validation errors for the convert form.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Controls the dismiss confirm dialog visibility.
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  // Operators that match the currently selected category and are ACTIVE.
  // This mirrors the eligibleOperators logic in CreateTaskPage.
  // The backend enforces the same rule — this is a UX hint, not security.
  const eligibleOperators = operators.filter(
    (op) => op.status === "ACTIVE" && op.specializationCategory === category,
  );

  // When dispatchMode changes, clear assigneeId to avoid stale/invalid values.
  function handleDispatchModeChange(mode: TaskDispatchMode) {
    setDispatchMode(mode);
    setAssigneeId("");
  }

  // When category changes, reset the assignee because the eligible list changes.
  function handleCategoryChange(cat: TaskCategory) {
    setCategory(cat);
    setAssigneeId("");
  }

  function validateConvert(): boolean {
    const errors: Record<string, string> = {};

    if (!summary.trim()) {
      errors.summary = "Summary is required.";
    } else if (summary.trim().length > 255) {
      errors.summary = "Summary must be at most 255 characters.";
    }

    if (dispatchMode === "DIRECT_ASSIGNMENT" && !assigneeId) {
      errors.assigneeId = "Please select an operator for direct assignment.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleConvertSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateConvert()) return;

    // Build the payload. propertyId is NOT included — backend inherits it
    // from the source report automatically.
    const payload: ConvertIssueReportRequest = {
      category,
      priority,
      summary: summary.trim(),
      ...(taskDescription.trim()
        ? { description: taskDescription.trim() }
        : {}),
      dispatchMode,
      // For POOL: omit assigneeId entirely (null/undefined → backend would 400).
      // For DIRECT_ASSIGNMENT: send the selected operator id.
      ...(dispatchMode === "DIRECT_ASSIGNMENT"
        ? { assigneeId }
        : { assigneeId: null }),
      ...(estimatedHours ? { estimatedHours: Number(estimatedHours) } : {}),
    };

    await onConvert(payload);
  }

  async function handleDismissConfirm() {
    setShowDismissConfirm(false);
    await onDismiss();
  }

  return (
    <>
      {/* ── Convert to Task form ── */}
      <div className="ro-form-card mb-4">
        <h2 className="h6 fw-semibold mb-3">
          <i
            className="bi bi-arrow-right-circle me-2 text-success"
            aria-hidden="true"
          />
          Convert to Task
        </h2>
        <p className="text-muted small mb-3">
          The property is inherited automatically from this report. Fill in the
          task details below.
        </p>

        <form onSubmit={handleConvertSubmit} noValidate>
          {/* Category */}
          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category <span className="text-danger">*</span>
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as TaskCategory)
              }
              disabled={acting}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="mb-3">
            <label htmlFor="priority" className="form-label">
              Priority <span className="text-danger">*</span>
            </label>
            <select
              id="priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              disabled={acting}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="mb-3">
            <label htmlFor="summary" className="form-label">
              Summary <span className="text-danger">*</span>
            </label>
            <input
              id="summary"
              type="text"
              className={`form-control ${fieldErrors.summary ? "is-invalid" : ""}`}
              placeholder="Short task title (max 255 characters)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={acting}
              maxLength={255}
            />
            {fieldErrors.summary && (
              <div className="invalid-feedback">{fieldErrors.summary}</div>
            )}
          </div>

          {/* Task description (optional) */}
          <div className="mb-3">
            <label htmlFor="taskDescription" className="form-label">
              Task description
              <span className="text-muted small ms-1">(optional)</span>
            </label>
            <textarea
              id="taskDescription"
              className="form-control"
              rows={3}
              placeholder="Additional instructions for the operator (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              disabled={acting}
              maxLength={2000}
            />
          </div>

          {/* Dispatch mode */}
          <div className="mb-3">
            <label className="form-label">
              Dispatch mode <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dispatchMode"
                  id="modePool"
                  value="POOL"
                  checked={dispatchMode === "POOL"}
                  onChange={() => handleDispatchModeChange("POOL")}
                  disabled={acting}
                />
                <label className="form-check-label" htmlFor="modePool">
                  Pool
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dispatchMode"
                  id="modeDirect"
                  value="DIRECT_ASSIGNMENT"
                  checked={dispatchMode === "DIRECT_ASSIGNMENT"}
                  onChange={() => handleDispatchModeChange("DIRECT_ASSIGNMENT")}
                  disabled={acting}
                />
                <label className="form-check-label" htmlFor="modeDirect">
                  Direct assignment
                </label>
              </div>
            </div>
          </div>

          {/* Assignee select — conditionally visible for DIRECT_ASSIGNMENT */}
          {dispatchMode === "DIRECT_ASSIGNMENT" && (
            <div className="mb-3">
              <label htmlFor="assigneeId" className="form-label">
                Operator <span className="text-danger">*</span>
              </label>
              {eligibleOperators.length === 0 ? (
                // Warn the Admin — no eligible operators for this category.
                // They can change the category or the dispatch mode.
                <div className="alert alert-warning py-2 small mb-0">
                  <i
                    className="bi bi-exclamation-triangle me-1"
                    aria-hidden="true"
                  />
                  No active operators with <strong>{category}</strong>{" "}
                  specialization. Change the category or use Pool mode.
                </div>
              ) : (
                <select
                  id="assigneeId"
                  className={`form-select ${fieldErrors.assigneeId ? "is-invalid" : ""}`}
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={acting}
                >
                  <option value="">Select an operator</option>
                  {eligibleOperators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.fullName}
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.assigneeId && (
                <div className="invalid-feedback d-block">
                  {fieldErrors.assigneeId}
                </div>
              )}
            </div>
          )}

          {/* Estimated hours (optional) */}
          <div className="mb-4">
            <label htmlFor="estimatedHours" className="form-label">
              Estimated hours
              <span className="text-muted small ms-1">(optional)</span>
            </label>
            <input
              id="estimatedHours"
              type="number"
              className="form-control"
              placeholder="e.g. 2"
              min={1}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              disabled={acting}
              style={{ maxWidth: 120 }}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-success" disabled={acting}>
              {acting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Converting…
                </>
              ) : (
                <>
                  <i
                    className="bi bi-arrow-right-circle me-2"
                    aria-hidden="true"
                  />
                  Convert to Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Dismiss section ── */}
      <div className="ro-form-card">
        <h2 className="h6 fw-semibold mb-2 text-muted">
          <i className="bi bi-archive me-2" aria-hidden="true" />
          Dismiss Report
        </h2>
        <p className="text-muted small mb-3">
          Archive this report without creating a task. This cannot be undone.
        </p>

        {!showDismissConfirm ? (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowDismissConfirm(true)}
            disabled={acting}
          >
            <i className="bi bi-archive me-1" aria-hidden="true" />
            Dismiss
          </button>
        ) : (
          // Inline confirmation — avoids a full modal for a simple destructive action.
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted small">Are you sure?</span>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDismissConfirm}
              disabled={acting}
            >
              {acting ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Yes, dismiss"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowDismissConfirm(false)}
              disabled={acting}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}

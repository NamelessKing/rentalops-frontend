// EditOperatorPage.tsx
// Admin page for editing an existing operator's profile.
//
// Route:  /admin/operators/:operatorId/edit
// Access: ADMIN only
//
// Why this page exists:
// Allows the Admin to update an operator's name, email, specialization, and
// optionally reset their password. It also provides inline disable/enable toggle.
// Data is pre-populated from the operator passed via navigation state when coming
// from the list, or fetched from the API as a fallback.

import { useParams, Link, useLocation, Navigate } from "react-router-dom";
import { useEditOperator } from "@/features/operators/hooks/useEditOperator";
import { useOperatorTasksOverview } from "@/features/tasks/hooks/useOperatorTasksOverview";
import type { TaskListItem } from "@/features/tasks/types";
import type {
  OperatorListItem,
  SpecializationCategory,
} from "@/features/operators/types";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";

// Shape of the optional state passed from OperatorListPage via the Edit link.
// Sending it here avoids a redundant API call on normal navigation.
interface EditOperatorLocationState {
  operator?: OperatorListItem;
}

// TaskRows renders a compact, bordered list of task rows for a single status section.
// It lives in this file rather than a shared component folder because it is only
// ever used on this page — no need to generalise it prematurely.
// `total` is the pre-slice count so a truncation hint can appear when the preview
// limit was reached.
function TaskRows({ tasks, total }: { tasks: TaskListItem[]; total: number }) {
  return (
    <ul className="list-unstyled mb-0">
      {tasks.map((task, idx) => (
        <li
          key={task.id}
          className={idx < tasks.length - 1 ? "border-bottom pb-3 mb-3" : ""}
        >
          {/* Top row: location context + quick action.
              Keeping View in the header makes scanning and navigation faster. */}
          <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
            <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
              {task.propertyName}
            </p>
            <Link
              to={`/admin/tasks/${task.id}`}
              className="btn btn-outline-primary btn-sm flex-shrink-0"
              style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
            >
              View
            </Link>
          </div>

          {/* Summary stays on its own row so it remains easy to read. */}
          <p
            className="mb-2 fw-medium"
            style={{ fontSize: "0.9rem", lineHeight: 1.35 }}
          >
            {task.summary}
          </p>

          {/* Bottom row: compact metadata cluster (status + priority). */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <StatusBadge status={task.status} type="task" />
            <span
              className="badge text-bg-light border"
              style={{ fontSize: "0.7rem" }}
            >
              {task.priority}
            </span>
          </div>
        </li>
      ))}

      {/* Truncation hint — only shown when total exceeds the preview limit. */}
      {total > tasks.length && (
        <li className="mt-2">
          <p className="text-muted small mb-0">
            Showing {tasks.length} of {total}
          </p>
        </li>
      )}
    </ul>
  );
}

export function EditOperatorPage() {
  const { operatorId } = useParams<{ operatorId: string }>();
  const location = useLocation();

  // Recover operator data from navigation state (set when clicking Edit in the list).
  const initialOperator = (location.state as EditOperatorLocationState | null)
    ?.operator;

  const {
    data,
    loading,
    error,
    draft,
    setDraft,
    save,
    saving,
    saveError,
    saveSuccess,
    toggleStatus,
    toggling,
    toggleError,
  } = useEditOperator(operatorId ?? "", initialOperator);

  // Single consolidated fetch for all task-panel data.
  // Previously two hooks each fired GET /tasks; this replaces both with one call.
  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
  } = useOperatorTasksOverview(operatorId ?? "");

  // If the operator ID was not found after loading, redirect to the list.
  if (!loading && error === "Operator not found.") {
    return <Navigate to="/admin/operators" replace />;
  }

  if (loading) {
    return (
      <section aria-live="polite">
        <PageHeader title="Edit Operator" />
        <div className="ro-form-card text-center text-muted py-4">
          Loading operator details…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <PageHeader title="Edit Operator" />
        <div className="alert alert-danger">{error}</div>
        <Link
          to="/admin/operators"
          className="btn btn-outline-secondary btn-sm mt-2"
        >
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Back to Team
        </Link>
      </section>
    );
  }

  // At this point data is guaranteed non-null (loading done, no error).
  if (!data) return null;

  // isActive drives both the badge colour and the disable/enable CTA label.
  const isActive = data.status === "ACTIVE";

  return (
    <section>
      {/* PageHeader with back-nav action. */}
      <PageHeader
        title="Edit Operator"
        action={
          <Link
            to="/admin/operators"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Back to Team
          </Link>
        }
      />

      {/* Two-column grid on lg and above: form + workload on the left,
          active tasks preview on the right. On smaller screens both
          columns stack vertically in DOM order (form → workload → tasks). */}
      <div className="row g-4">
        {/* ── Left column: edit form + workload summary ── */}
        <div className="col-12 col-lg-6">
          <div className="ro-form-card">
            {/* Status badge — read-only, updates immediately after toggle. */}
            <div className="mb-3">
              <span className="text-muted me-2">Status:</span>
              <StatusBadge status={data.status} type="operator" />
            </div>

            {/* Feedback alerts — only one should be visible at a time */}
            {saveSuccess && (
              <div className="alert alert-success py-2" role="status">
                Operator updated successfully.
              </div>
            )}
            {saveError && (
              <div className="alert alert-danger py-2" role="alert">
                {saveError}
              </div>
            )}
            {toggleError && (
              <div className="alert alert-warning py-2" role="alert">
                {toggleError}
              </div>
            )}

            {/* Edit form — fields pre-populated from current operator data */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
              noValidate
            >
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  value={draft.fullName}
                  onChange={(e) =>
                    setDraft({ ...draft, fullName: e.target.value })
                  }
                  required
                  disabled={saving || toggling}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({ ...draft, email: e.target.value })
                  }
                  required
                  disabled={saving || toggling}
                />
              </div>

              {/* Password is always optional on edit — blank means keep existing */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  value={draft.newPassword}
                  placeholder="Leave blank to keep current password"
                  onChange={(e) =>
                    setDraft({ ...draft, newPassword: e.target.value })
                  }
                  disabled={saving || toggling}
                />
                <div className="form-text">
                  Leave blank to keep the existing password unchanged.
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="specializationCategory" className="form-label">
                  Specialization
                </label>
                <select
                  id="specializationCategory"
                  className="form-select"
                  value={draft.specializationCategory}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      specializationCategory: e.target
                        .value as SpecializationCategory,
                    })
                  }
                  disabled={saving || toggling}
                >
                  <option value="CLEANING">CLEANING</option>
                  <option value="PLUMBING">PLUMBING</option>
                  <option value="ELECTRICAL">ELECTRICAL</option>
                  <option value="GENERAL_MAINTENANCE">
                    GENERAL_MAINTENANCE
                  </option>
                </select>
              </div>

              {/* Primary CTA: save form + secondary CTA: toggle status.
              d-grid stacks the buttons full-width on every screen — important on mobile. */}
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || toggling}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {/* Disable/Enable button — label and colour change based on current status */}
                <button
                  type="button"
                  className={`btn ${
                    isActive ? "btn-outline-danger" : "btn-outline-success"
                  }`}
                  onClick={() => void toggleStatus()}
                  disabled={saving || toggling}
                >
                  {toggling
                    ? "Updating..."
                    : isActive
                      ? "Disable Operator"
                      : "Enable Operator"}
                </button>
              </div>
            </form>
          </div>

          {/* Compact workload snapshot for quick visual scan.
              Reuses the same unified task overview state to avoid extra fetches. */}
          <div className="mt-3" style={{ maxWidth: "640px" }}>
            <div className="ro-section-panel">
              <div className="ro-section-panel-header">Workload</div>
              <div className="p-3">
                {overviewLoading && (
                  <p className="text-muted small mb-0">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Loading…
                  </p>
                )}

                {overviewError && !overviewLoading && (
                  <p className="text-muted small mb-0">{overviewError}</p>
                )}

                {!overviewLoading && !overviewError && overview !== null && (
                  <div className="row row-cols-3 g-2">
                    <div className="col">
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: "var(--ro-bg)" }}
                      >
                        <p
                          className="mb-0 text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Assigned
                        </p>
                        <p
                          className="mb-0 fw-semibold"
                          style={{ fontSize: "1.25rem" }}
                        >
                          {overview.counts.assigned}
                        </p>
                      </div>
                    </div>

                    <div className="col">
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: "var(--ro-bg)" }}
                      >
                        <p
                          className="mb-0 text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          In Progress
                        </p>
                        <p
                          className="mb-0 fw-semibold"
                          style={{
                            fontSize: "1.25rem",
                            color: "var(--ro-warning)",
                          }}
                        >
                          {overview.counts.inProgress}
                        </p>
                      </div>
                    </div>

                    <div className="col">
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: "var(--ro-bg)" }}
                      >
                        <p
                          className="mb-0 text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Completed
                        </p>
                        <p
                          className="mb-0 fw-semibold"
                          style={{
                            fontSize: "1.25rem",
                            color: "var(--ro-success)",
                          }}
                        >
                          {overview.counts.completed}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* end left col */}

        {/* ── Right column: task overview ── */}
        {/* Three status sections sourced from a single fetch.
            Empty sections are hidden so the panel stays compact. */}
        <div className="col-12 col-lg-6">
          <div className="ro-section-panel">
            <div className="ro-section-panel-header">Task Overview</div>
            <div className="p-3">
              {/* Non-blocking loading spinner. */}
              {overviewLoading && (
                <p className="text-muted small mb-0">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Loading…
                </p>
              )}

              {/* Error state — non-blocking; the edit form still works. */}
              {overviewError && !overviewLoading && (
                <p className="text-muted small mb-0">{overviewError}</p>
              )}

              {/* All-empty state — operator has no tasks in any bucket. */}
              {!overviewLoading &&
                !overviewError &&
                overview !== null &&
                overview.counts.inProgress === 0 &&
                overview.counts.assigned === 0 &&
                overview.counts.completed === 0 && (
                  <p className="text-muted small mb-0">
                    No tasks assigned yet.
                  </p>
                )}

              {/* In Progress section — hidden when the bucket is empty. */}
              {!overviewLoading &&
                !overviewError &&
                overview !== null &&
                overview.counts.inProgress > 0 && (
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
                      In Progress ({overview.counts.inProgress})
                    </p>
                    <TaskRows
                      tasks={overview.inProgressTasks}
                      total={overview.counts.inProgress}
                    />
                  </div>
                )}

              {/* Assigned section — hidden when the bucket is empty. */}
              {!overviewLoading &&
                !overviewError &&
                overview !== null &&
                overview.counts.assigned > 0 && (
                  <div
                    className="mb-3 p-3 rounded-3 border"
                    style={{
                      backgroundColor: "var(--ro-bg)",
                      borderColor: "var(--ro-border)",
                    }}
                  >
                    <p
                      className="small fw-semibold mb-3"
                      style={{ letterSpacing: "0.02em" }}
                    >
                      Assigned ({overview.counts.assigned})
                    </p>
                    <TaskRows
                      tasks={overview.assignedTasks}
                      total={overview.counts.assigned}
                    />
                  </div>
                )}

              {/* Completed section — hidden when the bucket is empty. */}
              {!overviewLoading &&
                !overviewError &&
                overview !== null &&
                overview.counts.completed > 0 && (
                  <div
                    className="p-3 rounded-3 border"
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
                      Completed ({overview.counts.completed})
                    </p>
                    <TaskRows
                      tasks={overview.completedTasks}
                      total={overview.counts.completed}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
        {/* end right col */}
      </div>
      {/* end row g-4 */}
    </section>
  );
}

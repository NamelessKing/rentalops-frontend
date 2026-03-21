// AdminTaskDetailPage.tsx
// Admin read-only view of a single task's full details.
//
// Why no Start / Complete buttons here:
// Those transitions are Operator-only actions. The Admin view
// is intentionally read-only.

import { Link, useParams } from "react-router-dom";
import { useTaskDetail } from "@/features/tasks/hooks/useTaskDetail";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";

export function AdminTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data: task, loading, error, reload } = useTaskDetail(taskId);

  if (loading) {
    return (
      <section aria-live="polite">
        <p className="text-muted">Loading task…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => void reload()}
          >
            Retry
          </button>
        </div>
        <Link
          to="/admin/tasks"
          className="btn btn-outline-secondary btn-sm mt-2"
        >
          Back to Tasks
        </Link>
      </section>
    );
  }

  if (!task) return null;

  return (
    <section>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/tasks" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Back
        </Link>
        <h1 className="h4 mb-0">Task Detail</h1>
      </div>

      {/* ro-section-panel: lightly-bounded surface for the detail block. */}
      <div className="ro-section-panel p-3">
        <dl className="mb-0">
          {/* Each dl-row is a 2-column (label / value) grid row with a bottom border. */}
          <div className="dl-row">
            <dt>Status</dt>
            <dd>
              <TaskStatusBadge status={task.status} />
            </dd>
          </div>

          <div className="dl-row">
            <dt>Property</dt>
            <dd>{task.propertyName ?? "—"}</dd>
          </div>

          <div className="dl-row">
            <dt>Category</dt>
            <dd>{task.category}</dd>
          </div>

          <div className="dl-row">
            <dt>Priority</dt>
            <dd>{task.priority}</dd>
          </div>

          <div className="dl-row">
            <dt>Summary</dt>
            <dd>{task.summary}</dd>
          </div>

          {task.description && (
            <div className="dl-row">
              <dt>Description</dt>
              <dd>{task.description}</dd>
            </div>
          )}

          <div className="dl-row">
            <dt>Dispatch mode</dt>
            <dd>
              {task.dispatchMode === "POOL" ? "Pool" : "Direct assignment"}
            </dd>
          </div>

          {task.assigneeName && (
            <div className="dl-row">
              <dt>Assignee</dt>
              <dd>{task.assigneeName}</dd>
            </div>
          )}

          {task.estimatedHours !== null && (
            <div className="dl-row">
              <dt>Estimated hours</dt>
              <dd>{task.estimatedHours}h</dd>
            </div>
          )}

          {/* sourceIssueReportId will link to the issue report page when that feature is available. */}
          {task.sourceIssueReportId && (
            <div className="dl-row">
              <dt>From issue report</dt>
              <dd>
                <code>{task.sourceIssueReportId}</code>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

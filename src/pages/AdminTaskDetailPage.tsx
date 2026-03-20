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
          &larr; Back
        </Link>
        <h1 className="h4 mb-0">Task Detail</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-3">Status</dt>
            <dd className="col-sm-9">
              <TaskStatusBadge status={task.status} />
            </dd>

            <dt className="col-sm-3">Property</dt>
            <dd className="col-sm-9">{task.propertyName ?? "—"}</dd>

            <dt className="col-sm-3">Category</dt>
            <dd className="col-sm-9">{task.category}</dd>

            <dt className="col-sm-3">Priority</dt>
            <dd className="col-sm-9">{task.priority}</dd>

            <dt className="col-sm-3">Summary</dt>
            <dd className="col-sm-9">{task.summary}</dd>

            {task.description && (
              <>
                <dt className="col-sm-3">Description</dt>
                <dd className="col-sm-9">{task.description}</dd>
              </>
            )}

            <dt className="col-sm-3">Dispatch mode</dt>
            <dd className="col-sm-9">
              {task.dispatchMode === "POOL" ? "Pool" : "Direct assignment"}
            </dd>

            {task.assigneeName && (
              <>
                <dt className="col-sm-3">Assignee</dt>
                <dd className="col-sm-9">{task.assigneeName}</dd>
              </>
            )}

            {task.estimatedHours !== null && (
              <>
                <dt className="col-sm-3">Estimated hours</dt>
                <dd className="col-sm-9">{task.estimatedHours}h</dd>
              </>
            )}

            {/* sourceIssueReportId will link to the issue report page when that feature is available. */}
            {task.sourceIssueReportId && (
              <>
                <dt className="col-sm-3">From issue report</dt>
                <dd className="col-sm-9">
                  <code>{task.sourceIssueReportId}</code>
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}

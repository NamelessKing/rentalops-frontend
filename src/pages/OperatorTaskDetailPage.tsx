// OperatorTaskDetailPage.tsx
// Operator view of a single task's full details.
//
// Shares useTaskDetail with AdminTaskDetailPage — same endpoint, same shape.
// The difference is that this page shows Start / Complete CTAs (not yet active).
//
// A 403 response means the operator is not the assignee of this task.
// useTaskDetail already maps this to a readable error message.

import { Link, useParams } from "react-router-dom";
import { useTaskDetail } from "@/features/tasks/hooks/useTaskDetail";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";

export function OperatorTaskDetailPage() {
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
    // Don't show Retry for "not assigned" errors — retrying would give the same 403.
    const isAccessDenied = error.includes("not assigned");

    return (
      <section aria-live="assertive">
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span>{error}</span>
          {!isAccessDenied && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => void reload()}
            >
              Retry
            </button>
          )}
        </div>
        <Link
          to="/operator/tasks"
          className="btn btn-outline-secondary btn-sm mt-2"
        >
          Back to My Tasks
        </Link>
      </section>
    );
  }

  if (!task) return null;

  return (
    <section>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/operator/tasks" className="btn btn-outline-secondary btn-sm">
          &larr; Back
        </Link>
        <h1 className="h4 mb-0">Task Detail</h1>
      </div>

      <div className="card shadow-sm mb-3">
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

            {task.estimatedHours !== null && (
              <>
                <dt className="col-sm-3">Estimated hours</dt>
                <dd className="col-sm-9">{task.estimatedHours}h</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* CTAs — visible but not yet functional.
          Will be wired once PATCH /tasks/{id}/start and /complete are ready. */}
      <div className="d-flex gap-2">
        {task.status === "ASSIGNED" && (
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled
            title="Coming soon — available in next update"
          >
            Start Task
          </button>
        )}

        {task.status === "IN_PROGRESS" && (
          <button
            type="button"
            className="btn btn-outline-success"
            disabled
            title="Coming soon — available in next update"
          >
            Mark Complete
          </button>
        )}
      </div>
    </section>
  );
}

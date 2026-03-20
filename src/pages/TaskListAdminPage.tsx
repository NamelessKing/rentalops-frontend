// TaskListAdminPage.tsx
// Admin page listing all tenant tasks with status badges and row navigation.
//
// Why this page exists:
// Admin users need to see the full task roster — its status,
// dispatch mode and assignee — before drilling into a specific task.

import { Link, useNavigate } from "react-router-dom";
import { useTaskListAdmin } from "@/features/tasks/hooks/useTaskListAdmin";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";

// Bootstrap bg-* class per priority level — keeps it readable at a glance.
const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-success",
  MEDIUM: "bg-info text-dark",
  HIGH: "bg-warning text-dark",
  CRITICAL: "bg-danger",
};

const DISPATCH_LABELS: Record<string, string> = {
  POOL: "Pool",
  DIRECT_ASSIGNMENT: "Direct",
};

export function TaskListAdminPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useTaskListAdmin();

  if (loading) {
    return (
      <section aria-live="polite">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Tasks</h1>
          <Link to="/admin/tasks/new" className="btn btn-primary" aria-disabled>
            New Task
          </Link>
        </div>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading tasks…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Tasks</h1>
          <Link to="/admin/tasks/new" className="btn btn-primary">
            New Task
          </Link>
        </div>
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
      </section>
    );
  }

  const tasks = data ?? [];

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Tasks</h1>
        <Link to="/admin/tasks/new" className="btn btn-primary">
          New Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            No tasks yet.{" "}
            <Link to="/admin/tasks/new">Create the first one.</Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
               7 columns would be unreadable on a phone. Cards expose the same
               data in a tappable, scrollable stack. */}
          <div className="d-block d-md-none">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="card mb-3 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/tasks/${task.id}`)}
                role="button"
                aria-label={`Open task: ${task.summary}`}
              >
                <div className="card-body">
                  {/* Row 1: summary + status badge */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <h6 className="card-title mb-0">{task.summary}</h6>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  {/* Row 2: property · category */}
                  <p className="text-muted small mb-2">
                    {task.propertyName ?? "—"} &middot; {task.category}
                  </p>
                  {/* Row 3: priority badge + dispatch mode badge + optional assignee */}
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span
                      className={`badge ${PRIORITY_BADGE[task.priority] ?? "bg-secondary"}`}
                    >
                      {task.priority}
                    </span>
                    <span className="badge text-bg-light border">
                      {DISPATCH_LABELS[task.dispatchMode] ?? task.dispatchMode}
                    </span>
                    {task.assigneeName && (
                      <span className="small text-muted">
                        {task.assigneeName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table — visible on md and above ── */}
          <div className="d-none d-md-block">
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Property</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Summary</th>
                      <th>Status</th>
                      <th>Mode</th>
                      <th>Assignee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/tasks/${task.id}`)}
                      >
                        <td>{task.propertyName ?? "—"}</td>
                        <td>{task.category}</td>
                        <td>
                          <span
                            className={`badge ${PRIORITY_BADGE[task.priority] ?? "bg-secondary"}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td>{task.summary}</td>
                        <td>
                          <TaskStatusBadge status={task.status} />
                        </td>
                        <td>
                          {DISPATCH_LABELS[task.dispatchMode] ??
                            task.dispatchMode}
                        </td>
                        <td>{task.assigneeName ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

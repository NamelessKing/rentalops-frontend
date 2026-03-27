// TaskListAdminPage.tsx
// Admin page listing all tenant tasks with status badges and row navigation.
//
// Why this page exists:
// Admin users need to see the full task roster — its status,
// dispatch mode and assignee — before drilling into a specific task.

import { Link, useNavigate } from "react-router-dom";
import { useTaskListAdmin } from "@/features/tasks/hooks/useTaskListAdmin";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";

// Maps priority level to the custom badge class from theme.css.
// These use design tokens rather than raw Bootstrap bg-* classes.
const PRIORITY_BADGE: Record<string, string> = {
  LOW: "ro-badge-low",
  MEDIUM: "ro-badge-medium",
  HIGH: "ro-badge-high",
  CRITICAL: "ro-badge-critical",
};

const DISPATCH_LABELS: Record<string, string> = {
  POOL: "Pool",
  DIRECT_ASSIGNMENT: "Direct",
};

export function TaskListAdminPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useTaskListAdmin();

  // Shared CTA button for New Task
  const newTaskCTA = (
    <Link to="/admin/tasks/new" className="btn btn-primary">
      <i className="bi bi-plus-lg me-2" aria-hidden="true" />
      New Task
    </Link>
  );

  if (loading) {
    return (
      <section aria-live="polite">
        <PageHeader title="Tasks" action={newTaskCTA} />
        <div className="ro-section-panel">
          <div
            className="p-4 text-center"
            style={{ color: "var(--ro-text-muted)" }}
          >
            Loading tasks…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <PageHeader title="Tasks" action={newTaskCTA} />
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
      <PageHeader title="Tasks" action={newTaskCTA} />

      {tasks.length === 0 ? (
        <EmptyState
          icon="bi-clipboard-check"
          title="No tasks yet"
          message="Create your first task to start coordinating your team's work."
          action={
            <Link to="/admin/tasks/new" className="btn btn-primary">
              Create first task
            </Link>
          }
        />
      ) : (
        <>
          {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
               7 columns would be unreadable on a phone. Cards expose the same
               data in a tappable, scrollable stack. */}
          <div className="d-block d-md-none">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="ro-task-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/tasks/${task.id}`)}
                role="button"
                aria-label={`Open task: ${task.summary}`}
              >
                <div className="card-body">
                  {/* Row 1: summary + status badge */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <span className="ro-card-title">{task.summary}</span>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  {/* Row 2: property · category */}
                  <p className="ro-card-meta mb-2">
                    {task.propertyName ?? "—"} &middot; {task.category}
                  </p>
                  {/* Row 3: priority badge + dispatch mode badge + optional assignee */}
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span
                      className={`badge ${PRIORITY_BADGE[task.priority] ?? "ro-badge-medium"}`}
                    >
                      {task.priority}
                    </span>
                    <span className="badge ro-badge-pending">
                      {DISPATCH_LABELS[task.dispatchMode] ?? task.dispatchMode}
                    </span>
                    {task.assigneeName && (
                      <span className="ro-card-meta">{task.assigneeName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table — visible on md and above ── */}
          <div className="d-none d-md-block">
            <div className="ro-section-panel">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
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
                        <td style={{ color: "var(--ro-text-muted)" }}>
                          {task.propertyName ?? "—"}
                        </td>
                        <td>{task.category}</td>
                        <td>
                          <span
                            className={`badge ${PRIORITY_BADGE[task.priority] ?? "ro-badge-medium"}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="fw-medium">{task.summary}</td>
                        <td>
                          <TaskStatusBadge status={task.status} />
                        </td>
                        <td
                          style={{
                            color: "var(--ro-text-muted)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {DISPATCH_LABELS[task.dispatchMode] ??
                            task.dispatchMode}
                        </td>
                        <td
                          style={{
                            color: "var(--ro-text-muted)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {task.assigneeName ?? "—"}
                        </td>
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

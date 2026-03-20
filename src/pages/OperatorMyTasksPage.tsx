// OperatorMyTasksPage.tsx
// Landing page after Operator login — shows tasks assigned to the authenticated operator.
//
// CTA buttons (Start, Complete) are rendered but disabled because the underlying
// backend transitions (PATCH /tasks/{id}/start, PATCH /tasks/{id}/complete) are
// not yet active. They will be enabled in a future update.

import { Link, useNavigate } from "react-router-dom";
import { useMyTasks } from "@/features/tasks/hooks/useMyTasks";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";
import type { MyTaskItem } from "@/features/tasks/types";

// Renders the conditional action button for a task row.
// Returns null for COMPLETED tasks — no action available.
function TaskCTA({ task }: { task: MyTaskItem }) {
  if (task.status === "ASSIGNED") {
    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled
        title="Coming soon — available in next update"
      >
        Start
      </button>
    );
  }

  if (task.status === "IN_PROGRESS") {
    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-success"
        disabled
        title="Coming soon — available in next update"
      >
        Complete
      </button>
    );
  }

  return null;
}

export function OperatorMyTasksPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useMyTasks();

  if (loading) {
    return (
      <section aria-live="polite">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">My Tasks</h1>
        </div>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading your tasks…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <h1 className="h4 mb-3">My Tasks</h1>
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
        <h1 className="h4 mb-0">My Tasks</h1>
        <Link to="/operator/pool" className="btn btn-outline-primary btn-sm">
          Browse Pool
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            No tasks assigned yet.{" "}
            <Link to="/operator/pool">Check the task pool.</Link>
          </div>
        </div>
      ) : (
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/operator/tasks/${task.id}`)}
                  >
                    <td>{task.propertyName ?? "—"}</td>
                    <td>{task.category}</td>
                    <td>{task.priority}</td>
                    <td>{task.summary}</td>
                    <td>
                      <TaskStatusBadge status={task.status} />
                    </td>
                    {/* Stop the row click from firing when the user clicks a CTA. */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <TaskCTA task={task} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

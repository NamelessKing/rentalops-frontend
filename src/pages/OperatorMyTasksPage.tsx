// OperatorMyTasksPage.tsx
// Landing page after Operator login — shows tasks assigned to the authenticated operator.
//
// Mobile-first design: card stack instead of a table.
// A table with 6 columns is unreadable on a phone screen. Cards adapt naturally
// to any viewport and give each task enough touch space.
//
// Inline actions (Start / Complete):
//   - The operator acts directly from this list without going to the detail page.
//   - localStatuses: per-task status overrides applied after a successful 204,
//     so the badge and CTA update immediately without refetching the list.
//   - actingId: ensures only one action is in flight at a time.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useMyTasks } from "@/features/tasks/hooks/useMyTasks";
import { startTask, completeTask } from "@/features/tasks/api/tasksApi";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";
import type { MyTaskItem, TaskStatus } from "@/features/tasks/types";

export function OperatorMyTasksPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useMyTasks();

  // Per-task status overrides — set after a successful Start or Complete (204).
  const [localStatuses, setLocalStatuses] = useState<
    Record<string, TaskStatus>
  >({});
  // Only one action at a time — tracks which task id is in-flight.
  const [actingId, setActingId] = useState<string | null>(null);
  // Dismissible alert shown when an inline action fails.
  const [actionError, setActionError] = useState<string | null>(null);

  // Returns the currently displayed status, preferring any local override.
  function getStatus(task: MyTaskItem): TaskStatus {
    return localStatuses[task.id] ?? task.status;
  }

  async function handleStart(taskId: string) {
    setActingId(taskId);
    setActionError(null);
    try {
      await startTask(taskId);
      setLocalStatuses((prev) => ({ ...prev, [taskId]: "IN_PROGRESS" }));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setActionError(
          "This transition is no longer valid. The list has been refreshed.",
        );
        void reload();
      } else {
        setActionError("Unable to start the task. Please try again.");
      }
    } finally {
      setActingId(null);
    }
  }

  async function handleComplete(taskId: string) {
    setActingId(taskId);
    setActionError(null);
    try {
      await completeTask(taskId);
      setLocalStatuses((prev) => ({ ...prev, [taskId]: "COMPLETED" }));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setActionError(
          "This transition is no longer valid. The list has been refreshed.",
        );
        void reload();
      } else {
        setActionError("Unable to complete the task. Please try again.");
      }
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <section aria-live="polite">
        <h1 className="h4 mb-3">My Tasks</h1>
        <div className="ro-task-card text-center text-muted py-4">
          Loading your tasks…
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
          <i className="bi bi-search me-1" aria-hidden="true" />
          Browse Pool
        </Link>
      </div>

      {/* Inline action error — dismissible banner on Start/Complete failure. */}
      {actionError && (
        <div
          className="alert alert-warning alert-dismissible d-flex align-items-start gap-2 mb-3"
          role="alert"
        >
          <span>{actionError}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            aria-label="Close"
            onClick={() => setActionError(null)}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        // ro-empty-state: centered column with icon for zero-data screens.
        <div className="ro-empty-state">
          <i className="bi bi-clipboard-check" aria-hidden="true" />
          <strong>No tasks assigned yet.</strong>
          <p className="mb-0 small">
            <Link to="/operator/pool">Browse the task pool</Link> to claim a
            task.
          </p>
        </div>
      ) : (
        // Card stack — one card per task, works on any screen width.
        // Tapping the card body navigates to full detail.
        // The action button at the footer fires inline without leaving the list.
        <div className="d-flex flex-column gap-3">
          {tasks.map((task) => {
            const currentStatus = getStatus(task);
            const isActing = actingId === task.id;

            return (
              <div key={task.id} className="ro-task-card">
                {/* Tappable body — navigates to the task detail page. */}
                <div
                  className="card-body"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/operator/tasks/${task.id}`)}
                  role="button"
                  aria-label={`Open task: ${task.summary}`}
                >
                  {/* Summary + badge side by side; badge stays right-aligned. */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <h6 className="card-title mb-0">{task.summary}</h6>
                    <TaskStatusBadge status={currentStatus} />
                  </div>
                  <p className="text-muted small mb-0">
                    {task.propertyName ?? "—"} &middot; {task.category} &middot;{" "}
                    {task.priority}
                  </p>
                </div>

                {/* Action footer — stopPropagation so the button doesn't also navigate. */}
                {currentStatus === "ASSIGNED" && (
                  <div
                    className="card-footer bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      disabled={isActing}
                      onClick={() => void handleStart(task.id)}
                    >
                      {isActing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Starting…
                        </>
                      ) : (
                        "Start Task"
                      )}
                    </button>
                  </div>
                )}

                {currentStatus === "IN_PROGRESS" && (
                  <div
                    className="card-footer bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn btn-success w-100"
                      disabled={isActing}
                      onClick={() => void handleComplete(task.id)}
                    >
                      {isActing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Completing…
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

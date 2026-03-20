// OperatorPoolPage.tsx
// Shows pool tasks filtered to the operator's specialization category.
//
// The backend applies the category filter automatically — no client-side filtering needed.
// An empty list means either no tasks match the category or the operator has no
// category configured. Both cases show the same empty state message.
//
// Claim flow:
//   - POST /tasks/{id}/claim → 200: redirect to /operator/tasks/:id (task detail).
//   - 409: another operator claimed first — show a dismissible warning and refresh the pool.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTaskPool } from "@/features/tasks/hooks/useTaskPool";
import { claimTask } from "@/features/tasks/api/tasksApi";

export function OperatorPoolPage() {
  const { data, loading, error, reload } = useTaskPool();
  const navigate = useNavigate();

  // claimingId: the id of the task currently being claimed, for per-card spinner.
  const [claimingId, setClaimingId] = useState<string | null>(null);
  // claimError: shown as a dismissible alert above the list on claim failures.
  const [claimError, setClaimError] = useState<string | null>(null);

  async function handleClaim(taskId: string) {
    setClaimingId(taskId);
    setClaimError(null);

    try {
      const result = await claimTask(taskId);
      // Redirect directly to the task detail so the operator can immediately Start.
      navigate(`/operator/tasks/${result.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          // Concurrent claim: another operator was faster. Refresh the pool so
          // the taken task disappears from the list, and show a clear message.
          setClaimError(
            "This task was just claimed by another operator. The list has been refreshed.",
          );
          void reload();
        } else if (status === 404) {
          setClaimError(
            "Task no longer available. The list has been refreshed.",
          );
          void reload();
        } else {
          setClaimError("Unable to claim this task. Please try again.");
        }
      } else {
        setClaimError("Unable to claim this task. Please try again.");
      }

      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <section aria-live="polite">
        <h1 className="h4 mb-3">Task Pool</h1>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading available tasks…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <h1 className="h4 mb-3">Task Pool</h1>
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
      <h1 className="h4 mb-3">Task Pool</h1>

      {/* Claim error — dismissible warning when a claim attempt fails or hits a 409. */}
      {claimError && (
        <div
          className="alert alert-warning alert-dismissible d-flex align-items-start gap-2 mb-3"
          role="alert"
        >
          <span>{claimError}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            aria-label="Close"
            onClick={() => setClaimError(null)}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            No tasks available for your category.
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-3">
          {tasks.map((task) => (
            <div key={task.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-1">{task.summary}</h6>
                  <p className="text-muted small mb-0">
                    {task.propertyName ?? "—"} &middot; {task.category} &middot;{" "}
                    {task.priority}
                    {task.estimatedHours ? ` · ${task.estimatedHours}h` : ""}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    // Disable the card being claimed; allow all other cards.
                    disabled={claimingId === task.id}
                    onClick={() => void handleClaim(task.id)}
                  >
                    {claimingId === task.id ? "Claiming…" : "Claim"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// OperatorTaskDetailPage.tsx
// Operator view of a single task's full details.
//
// Shares useTaskDetail with AdminTaskDetailPage — same endpoint, same shape.
// CTAs (Start / Complete) are exclusive to this page and only shown to the assignee.
//
// Local status pattern:
//   After a successful Start or Complete we get HTTP 204 (no body). Rather than
//   reloading the full task, we update a localStatus piece of state. The badge and
//   CTA visibility derive from `localStatus ?? task.status`, so the UI reflects the
//   new state immediately without an extra network request.
//
// Ownership check:
//   The backend enforces that only the assignee can Start / Complete (403 otherwise).
//   We also check locally (task.assigneeId === user.id) to avoid showing CTAs that
//   would always fail with 403 — cleaner UX and fewer unnecessary requests.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useTaskDetail } from "@/features/tasks/hooks/useTaskDetail";
import { useAuth } from "@/features/auth/useAuth";
import { startTask, completeTask } from "@/features/tasks/api/tasksApi";
import { TaskStatusBadge } from "@/features/tasks/components/TaskStatusBadge";
import type { TaskStatus } from "@/features/tasks/types";

export function OperatorTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data: task, loading, error, reload } = useTaskDetail(taskId);
  const { user } = useAuth();

  // localStatus: null means "use server value". Set to the new status after
  // a successful Start or Complete transition.
  const [localStatus, setLocalStatus] = useState<TaskStatus | null>(null);
  // acting: true while a Start or Complete request is in-flight.
  const [acting, setActing] = useState(false);
  // actionError: shown as a dismissible alert below the task card.
  const [actionError, setActionError] = useState<string | null>(null);

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

  // Derive current status — local override wins over the server value.
  const currentStatus: TaskStatus = localStatus ?? task.status;

  // Capture the id now so the async handlers below close over a string, not
  // TaskDetailResponse | null (TypeScript's control-flow narrowing doesn't
  // cross function-definition boundaries for variables from outer scope).
  // Named distinctly to avoid shadowing taskId from useParams above.
  const ownTaskId: string = task.id;

  // Only the assigned operator should see Start / Complete.
  const isOwner = task.assigneeId === user?.id;
  const canStart = isOwner && currentStatus === "ASSIGNED";
  const canComplete = isOwner && currentStatus === "IN_PROGRESS";

  async function handleStart() {
    setActing(true);
    setActionError(null);

    try {
      await startTask(ownTaskId);
      // 204 — no body. Reflect the new status locally.
      setLocalStatus("IN_PROGRESS");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          setActionError(
            "This transition is no longer valid. Reload to see the current status.",
          );
        } else {
          setActionError("Unable to start the task. Please try again.");
        }
      } else {
        setActionError("Unable to start the task. Please try again.");
      }
    } finally {
      setActing(false);
    }
  }

  async function handleComplete() {
    setActing(true);
    setActionError(null);

    try {
      await completeTask(ownTaskId);
      setLocalStatus("COMPLETED");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          setActionError(
            "This transition is no longer valid. Reload to see the current status.",
          );
        } else {
          setActionError("Unable to complete the task. Please try again.");
        }
      } else {
        setActionError("Unable to complete the task. Please try again.");
      }
    } finally {
      setActing(false);
    }
  }

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
              {/* currentStatus reflects any local override after Start/Complete. */}
              <TaskStatusBadge status={currentStatus} />
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

      {/* Action error — shown when Start or Complete fails. Reload to resync state. */}
      {actionError && (
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <span>{actionError}</span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setActionError(null);
              void reload();
            }}
          >
            Reload
          </button>
        </div>
      )}

      {/* CTAs — only rendered for the assignee, and only for valid transitions.
          d-grid makes every child button full-width automatically — ideal on mobile. */}
      <div className="d-grid gap-2">
        {canStart && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={acting}
            onClick={() => void handleStart()}
          >
            {acting ? "Starting…" : "Start Task"}
          </button>
        )}

        {canComplete && (
          <button
            type="button"
            className="btn btn-success"
            disabled={acting}
            onClick={() => void handleComplete()}
          >
            {acting ? "Completing…" : "Mark Complete"}
          </button>
        )}
      </div>
    </section>
  );
}

// PropertyTasksPanel.tsx
// A compact, read-only panel that shows tasks linked to a specific property,
// grouped by status so the Admin can read the operational state at a glance.
//
// Why this component exists:
//   The property detail page previously showed only master-data fields (code,
//   name, address). This panel adds operational context — the Admin can see at
//   a glance which tasks are running or pending for this property without
//   leaving the detail page.
//
//   It fetches all tenant tasks and filters by propertyId on the client side.
//   This avoids needing a new backend endpoint for the MVP.
//
// Visual language:
//   Mirrors the "Task Overview" panel on EditOperatorPage — tinted section
//   blocks, 3-row task rows (operator context / summary / badges), and the same
//   btn-outline-primary "View" button — adapted for property context.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePropertyTasks } from "@/features/tasks/hooks/usePropertyTasks";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { TaskListItem, TaskPriority } from "@/features/tasks/types";

interface PropertyTasksPanelProps {
  propertyId: string;
}

// How many tasks to show per status section before showing the overflow hint.
// Kept small so the panel stays a summary, not a duplicate of the task list page.
const PREVIEW_LIMIT = 3;

// Maps TaskPriority enum values to human-readable labels for the priority badge.
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

// Renders a compact 3-row task list for a single status section.
// Mirrors TaskRows from EditOperatorPage — same spacing, same badge style —
// but adapted for property context: the top row shows assigneeName
// instead of propertyName (since we are already on the property detail page).
// If no assignee exists yet (POOL / PENDING tasks), the left side stays empty
// and the View button remains right-aligned.
function PropertyTaskRows({
  tasks,
  total,
}: {
  tasks: TaskListItem[];
  total: number;
}) {
  return (
    <ul className="list-unstyled mb-0">
      {tasks.map((task, idx) => (
        <li
          key={task.id}
          className={idx < tasks.length - 1 ? "border-bottom pb-3 mb-3" : ""}
        >
          {/* Top row: operator context (when assigned) + View button.
              The flex container always renders so View stays right-aligned
              even when there is no assignee to show on the left. */}
          <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
            <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
              {task.assigneeName && (
                <>
                  <i className="bi bi-person me-1" aria-hidden="true" />
                  {task.assigneeName}
                </>
              )}
            </p>
            <Link
              to={`/admin/tasks/${task.id}`}
              className="btn btn-outline-primary btn-sm flex-shrink-0"
              style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
            >
              View
            </Link>
          </div>

          {/* Summary stays on its own row so it is easy to scan quickly. */}
          <p
            className="mb-2 fw-medium"
            style={{ fontSize: "0.9rem", lineHeight: 1.35 }}
          >
            {task.summary}
          </p>

          {/* Bottom row: status badge + priority badge. */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <StatusBadge status={task.status} type="task" />
            <span
              className="badge text-bg-light border"
              style={{ fontSize: "0.7rem" }}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>
        </li>
      ))}

      {/* Truncation hint — only shown when total exceeds the current preview count. */}
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

// Shows property tasks grouped by status: Pending, Assigned, In Progress, Completed.
// Only sections with at least one task are rendered — empty buckets stay hidden.
// Handles loading, error, empty, and success states explicitly.
export function PropertyTasksPanel({ propertyId }: PropertyTasksPanelProps) {
  const { data, loading, error, reload } = usePropertyTasks(propertyId);

  // Derive status buckets from the flat task list.
  // Counts are captured before slicing so totals in overflow hints stay accurate
  // even when the preview is truncated to PREVIEW_LIMIT.
  const buckets = useMemo(() => {
    if (!data) {
      return null;
    }

    const pendingAll = data.filter((t) => t.status === "PENDING");
    const assignedAll = data.filter((t) => t.status === "ASSIGNED");
    const inProgressAll = data.filter((t) => t.status === "IN_PROGRESS");
    const completedAll = data.filter((t) => t.status === "COMPLETED");

    return {
      pending: {
        total: pendingAll.length,
        preview: pendingAll.slice(0, PREVIEW_LIMIT),
      },
      assigned: {
        total: assignedAll.length,
        preview: assignedAll.slice(0, PREVIEW_LIMIT),
      },
      inProgress: {
        total: inProgressAll.length,
        preview: inProgressAll.slice(0, PREVIEW_LIMIT),
      },
      completed: {
        total: completedAll.length,
        preview: completedAll.slice(0, PREVIEW_LIMIT),
      },
    };
  }, [data]);

  // True when data has loaded and every bucket is empty.
  const isEmpty =
    buckets !== null &&
    buckets.pending.total === 0 &&
    buckets.assigned.total === 0 &&
    buckets.inProgress.total === 0 &&
    buckets.completed.total === 0;

  return (
    <div className="ro-section-panel">
      <div className="ro-section-panel-header">Task Overview</div>
      <div className="p-3">
        {loading && <p className="text-muted small mb-0">Loading tasks…</p>}

        {!loading && error && (
          <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0 py-2">
            <span className="small">{error}</span>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => void reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <p className="text-muted small mb-0">
            No tasks for this property yet.
          </p>
        )}

        {!loading && !error && buckets !== null && !isEmpty && (
          // Each section block is only rendered when the bucket has tasks.
          // Individual conditionals (not a loop) allow per-section color
          // customisation inline and keep the intent explicit.
          <div>
            {/* Pending section — neutral title, not alarming. */}
            {buckets.pending.total > 0 && (
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
                  Pending ({buckets.pending.total})
                </p>
                <PropertyTaskRows
                  tasks={buckets.pending.preview}
                  total={buckets.pending.total}
                />
              </div>
            )}

            {/* Assigned section — neutral title, operator named but not yet started. */}
            {buckets.assigned.total > 0 && (
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
                  Assigned ({buckets.assigned.total})
                </p>
                <PropertyTaskRows
                  tasks={buckets.assigned.preview}
                  total={buckets.assigned.total}
                />
              </div>
            )}

            {/* In Progress section — amber title signals active work. */}
            {buckets.inProgress.total > 0 && (
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
                  In Progress ({buckets.inProgress.total})
                </p>
                <PropertyTaskRows
                  tasks={buckets.inProgress.preview}
                  total={buckets.inProgress.total}
                />
              </div>
            )}

            {/* Completed section — green title signals done work.
              Last section has no bottom margin. */}
            {buckets.completed.total > 0 && (
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
                  Completed ({buckets.completed.total})
                </p>
                <PropertyTaskRows
                  tasks={buckets.completed.preview}
                  total={buckets.completed.total}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

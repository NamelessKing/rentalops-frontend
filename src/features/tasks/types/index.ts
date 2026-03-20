// types/index.ts — Task feature type definitions
//
// All types mirror the backend contract exactly.
// Field names are kept as-is to avoid silent drift during API integration.

// ─── Enum types ──────────────────────────────────────────────────────────────

export type TaskStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// POOL: task is visible to operators with a matching specialization category.
// DIRECT_ASSIGNMENT: task is immediately assigned to a specific operator.
export type TaskDispatchMode = "POOL" | "DIRECT_ASSIGNMENT";

// Same values as the operators feature specializationCategory field.
export type TaskCategory =
  | "CLEANING"
  | "PLUMBING"
  | "ELECTRICAL"
  | "GENERAL_MAINTENANCE";

// ─── Response shapes ─────────────────────────────────────────────────────────

// Row shape returned by GET /tasks (Admin list view).
// assigneeName and propertyName are already resolved by the backend — no client join needed.
export interface TaskListItem {
  id: string;
  propertyId: string;
  propertyName: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  summary: string;
  status: TaskStatus;
  dispatchMode: TaskDispatchMode;
  assigneeId: string | null;
  assigneeName: string | null;
}

// Full shape returned by GET /tasks/{id} and POST /tasks (201 response).
// Used by both Admin and Operator detail pages — same endpoint, same shape.
export interface TaskDetailResponse {
  id: string;
  propertyId: string;
  propertyName: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  summary: string;
  description: string | null;
  status: TaskStatus;
  dispatchMode: TaskDispatchMode;
  estimatedHours: number | null;
  assigneeId: string | null;
  assigneeName: string | null;
  // Populated only when this task was created from an issue report.
  sourceIssueReportId: string | null;
}

// Row shape returned by GET /tasks/pool (Operator pool view).
// Slimmer than TaskListItem — pool tasks are always PENDING and unassigned by definition.
export interface TaskPoolItem {
  id: string;
  propertyId: string;
  propertyName: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  summary: string;
  estimatedHours: number | null;
}

// Row shape returned by GET /tasks/my (Operator my-tasks view).
// Includes status so the list can render conditional CTAs (Start / Complete).
export interface MyTaskItem {
  id: string;
  propertyId: string;
  propertyName: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  summary: string;
  status: TaskStatus;
}

// ─── Request shapes ──────────────────────────────────────────────────────────

// POST /tasks request body.
//
// Business rules enforced by this shape:
//   - dispatchMode POOL   → assigneeId must be omitted entirely (NOT null — backend returns 400 if present)
//   - dispatchMode DIRECT → assigneeId is required
//   - status is never sent — backend assigns it based on dispatchMode
export interface CreateTaskRequest {
  propertyId: string;
  category: TaskCategory;
  priority: TaskPriority;
  summary: string;
  description?: string;
  dispatchMode: TaskDispatchMode;
  assigneeId?: string; // Omit entirely for POOL. Required for DIRECT_ASSIGNMENT.
  estimatedHours?: number;
}

// Response from POST /tasks/{id}/claim (HTTP 200).
// The task is now ASSIGNED to the authenticated operator.
// Use the returned id to redirect to /operator/tasks/:id without a second GET.
export interface ClaimTaskResponse {
  id: string;
  status: "ASSIGNED";
  assigneeId: string;
}

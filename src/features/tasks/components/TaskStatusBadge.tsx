// TaskStatusBadge.tsx
// Thin wrapper around the shared StatusBadge primitive.
//
// Why this still exists:
//   Four pages import TaskStatusBadge by name. Rather than changing all those
//   imports at once, we keep this file and delegate to the unified StatusBadge.
//   This means the colour mapping is now centralised in one place.

import { StatusBadge } from "@/shared/components/StatusBadge";
import type { TaskStatus } from "../types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

// Renders the task status using the shared StatusBadge with type="task".
export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return <StatusBadge status={status} type="task" />;
}

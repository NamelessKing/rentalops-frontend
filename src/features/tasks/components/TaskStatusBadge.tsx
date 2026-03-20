// TaskStatusBadge.tsx
// Presentational component that maps a TaskStatus value to a Bootstrap badge.
//
// Why this component exists:
// The same badge with the same colour logic appears on 4+ pages (admin list,
// admin detail, operator list, operator detail). Centralising it keeps
// the label and colour mapping in one place and avoids duplication.

import type { TaskStatus } from "../types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

// Colour and label mapping for the four possible task statuses.
const STATUS_CONFIG: Record<TaskStatus, { bgClass: string; label: string }> = {
  PENDING: { bgClass: "bg-secondary", label: "In attesa" },
  ASSIGNED: { bgClass: "bg-primary", label: "Assegnato" },
  IN_PROGRESS: { bgClass: "bg-warning text-dark", label: "In corso" },
  COMPLETED: { bgClass: "bg-success", label: "Completato" },
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const { bgClass, label } = STATUS_CONFIG[status];
  return <span className={`badge ${bgClass}`}>{label}</span>;
}

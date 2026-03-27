// StatusBadge.tsx
// Reusable presentational component for displaying entity status values.
//
// Why this exists:
//   Status labels appear in task lists, operator tables, property lists, and
//   detail pages. Having one component ensures the color mapping and visual
//   style are always consistent across the whole app.
//
// It replaces the narrower TaskStatusBadge that only handled task statuses,
// and extends support to operator and property statuses too.

// The shape of a status configuration entry.
interface StatusConfig {
  // CSS class from theme.css that gives this status its color
  className: string;
  // Human-readable Italian label shown to the user
  label: string;
}

// ── Task status mapping ──
// Maps PENDING/ASSIGNED/IN_PROGRESS/COMPLETED to semantic badge styles.
const TASK_STATUS: Record<string, StatusConfig> = {
  PENDING: { className: "ro-badge-pending", label: "In attesa" },
  ASSIGNED: { className: "ro-badge-assigned", label: "Assegnato" },
  IN_PROGRESS: { className: "ro-badge-in-progress", label: "In corso" },
  COMPLETED: { className: "ro-badge-completed", label: "Completato" },
};

// ── Operator status mapping ──
const OPERATOR_STATUS: Record<string, StatusConfig> = {
  ACTIVE: { className: "ro-badge-completed", label: "Attivo" },
  DISABLED: { className: "ro-badge-pending", label: "Disabilitato" },
};

// ── Property status mapping ──
const PROPERTY_STATUS: Record<string, StatusConfig> = {
  ACTIVE: { className: "ro-badge-completed", label: "Attiva" },
  INACTIVE: { className: "ro-badge-pending", label: "Inattiva" },
};

// ── Issue report status mapping ──
// OPEN      → yellow (waiting for Admin review)
// CONVERTED → green (turned into a task)
// DISMISSED → muted grey (archived without action)
const ISSUE_REPORT_STATUS: Record<string, StatusConfig> = {
  OPEN: { className: "ro-badge-pending", label: "Aperta" },
  CONVERTED: { className: "ro-badge-completed", label: "Convertita in task" },
  DISMISSED: { className: "ro-badge-dismissed", label: "Archiviata" },
};

// The type prop controls which mapping table to use.
// Defaults to 'task' if not provided.
type StatusType = "task" | "operator" | "property" | "issueReport";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

// Resolves the correct config object for the given type + status string.
function resolveConfig(type: StatusType, status: string): StatusConfig {
  const map =
    type === "operator"
      ? OPERATOR_STATUS
      : type === "property"
        ? PROPERTY_STATUS
        : type === "issueReport"
          ? ISSUE_REPORT_STATUS
          : TASK_STATUS;

  // Fall back to a neutral badge if an unknown status value is passed.
  return map[status] ?? { className: "ro-badge-pending", label: status };
}

export function StatusBadge({ status, type = "task" }: StatusBadgeProps) {
  const { className, label } = resolveConfig(type, status);
  // badge class from Bootstrap + our custom color class from theme.css
  return <span className={`badge ${className}`}>{label}</span>;
}

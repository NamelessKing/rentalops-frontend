// EmptyState.tsx
// Reusable empty / zero-data state component.
//
// Why this exists:
//   When a list has no items, we need a consistent, informative placeholder
//   rather than a blank page. This component provides a centered icon, title,
//   optional message, and optional CTA — styled through .ro-empty-state in theme.css.

import type { ReactNode } from "react";

interface EmptyStateProps {
  // Bootstrap Icons class name for the icon (e.g. "bi-inbox").
  // Rendered large above the title.
  icon?: string;
  // Short headline (e.g. "No tasks yet")
  title: string;
  // Longer explanatory text shown below the title
  message?: string;
  // Optional action button or link (e.g. <Link className="btn btn-primary">)
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    // ro-empty-state centers all children and provides the subtle panel border
    <div className="ro-empty-state">
      {/* Icon: large muted Bootstrap Icon, only if the caller provided one */}
      {icon && <i className={`bi ${icon} ro-empty-icon`} aria-hidden="true" />}

      <p className="ro-empty-title">{title}</p>

      {/* Message is optional: not every empty state needs an explanation */}
      {message && <p className="ro-empty-message">{message}</p>}

      {/* Action slot: typically a Link-as-button or a plain <button> */}
      {action}
    </div>
  );
}

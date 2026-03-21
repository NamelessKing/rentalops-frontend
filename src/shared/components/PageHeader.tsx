// PageHeader.tsx
// Reusable page header layout primitive.
//
// Why this exists:
//   Every list and detail page has a title + optional "Create" CTA in the
//   top-right corner. This component provides a consistent row layout so
//   all pages look the same — and so the spacing can be changed in one place.

import type { ReactNode } from "react";

interface PageHeaderProps {
  // The main page title shown as an <h1>
  title: string;
  // Optional subtitle / description shown below the title
  subtitle?: string;
  // Optional ReactNode rendered on the right side (e.g. a Link/button CTA)
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    // ro-page-header: flex row, space-between, wraps on very narrow screens.
    // Defined in theme.css.
    <div className="ro-page-header">
      <div>
        <h1 className="ro-page-title">{title}</h1>
        {/* Subtitle is optional — only rendered when provided */}
        {subtitle && <p className="ro-page-subtitle">{subtitle}</p>}
      </div>
      {/* Action slot: typically a Link rendered as btn-primary */}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

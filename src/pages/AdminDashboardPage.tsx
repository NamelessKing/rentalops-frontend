// AdminDashboardPage.tsx
// Admin landing page showing tenant-level operational counters.
//
// Why this page exists:
//   The dashboard gives Admin users an immediate snapshot of workload health
//   and clear next actions, so they can decide where to navigate first.

import { Link } from "react-router-dom";
import { useAdminSummary } from "@/features/dashboard/hooks/useAdminSummary";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";

interface StatCardProps {
  label: string;
  value: number;
  // Bootstrap Icons class (e.g. "bi-clock") — purely decorative, helps scan at a glance.
  icon?: string;
  // CSS color value or var() for the stat number — lets callers apply semantic color.
  accent?: string;
  // When supplied the entire card becomes a navigation link.
  to?: string;
  // When true, removes the outer border/surface — use for cards nested inside a panel
  // to avoid a visual "border inside border" effect. Styled with the page background
  // tint so nested cells still stand out from the panel surface.
  flat?: boolean;
}

// Small reusable KPI card. Optional icon and accent colour give visual hierarchy
// so admins can spot the most important counters without reading every label.
// Supports a `flat` variant for cells nested inside a ro-section-panel, and a
// navigable variant (via `to`) that uses ro-task-card's built-in CSS hover effect.
function StatCard({ label, value, icon, accent, to, flat }: StatCardProps) {
  const inner = (
    <>
      <p
        className="mb-1 d-flex align-items-center gap-1"
        style={{ color: "var(--ro-text-muted)", fontSize: "0.85rem" }}
      >
        {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
        {label}
      </p>
      <p
        className="mb-0 fw-semibold"
        style={{ fontSize: "1.5rem", color: accent ?? "inherit" }}
      >
        {value}
      </p>
    </>
  );

  // Navigable top-level card: ro-task-card already defines the CSS hover rule
  // (box-shadow lift + border-color shift) so we get the interaction for free.
  if (to) {
    return (
      <Link
        to={to}
        className="ro-task-card mb-0 h-100 d-block text-decoration-none p-3"
      >
        <p
          className="mb-1 d-flex align-items-center gap-1"
          style={{ color: "var(--ro-text-muted)", fontSize: "0.85rem" }}
        >
          {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
          {label}
        </p>
        <p
          className="mb-0 fw-semibold"
          style={{ fontSize: "1.75rem", color: accent ?? "inherit" }}
        >
          {value}
        </p>
      </Link>
    );
  }

  // Flat variant: no border/surface — blends into its parent panel.
  // Uses --ro-bg tint so the cell is gently distinct from the --ro-surface panel.
  if (flat) {
    return (
      <div
        className="h-100 p-2 rounded"
        style={{ backgroundColor: "var(--ro-bg)" }}
      >
        {inner}
      </div>
    );
  }

  return <div className="ro-section-panel h-100 p-3">{inner}</div>;
}

// Keeps empty-state branching readable and easy to extend in future slices.
function getEmptyStateModel(propertiesCount: number, operatorsCount: number) {
  if (propertiesCount === 0) {
    return {
      title: "No properties yet",
      message:
        "Create your first property to start assigning tasks and collecting issue reports.",
      primaryCtaLabel: "Create Property",
      primaryCtaTo: "/admin/properties/new",
      // Wireframe §7.1: when no properties exist, surface Operator and Task CTAs too
      // so the admin can set up the full stack in a single guided flow.
      showSecondaryOperatorCta: true,
    };
  }

  if (operatorsCount === 0) {
    return {
      title: "Team setup incomplete",
      message:
        "You have properties but no operators yet. Add your first operator to start distributing work.",
      primaryCtaLabel: "Create Operator",
      primaryCtaTo: "/admin/operators/new",
      showSecondaryOperatorCta: false,
    };
  }

  return null;
}

// Renders the Admin dashboard states: loading, error, empty, and success.
export function AdminDashboardPage() {
  const { data, loading, error, reload } = useAdminSummary();

  const refreshAction = (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => void reload()}
    >
      <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
      Refresh
    </button>
  );

  if (loading) {
    // Skeleton layout mirrors the real success structure so the page doesn't
    // visually "jump" when data arrives. Placeholder widths vary to look natural.
    return (
      <section aria-live="polite">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Operational summary for your tenant"
          action={refreshAction}
        />

        {/* Row 1: Properties + Operators KPI cards */}
        <div className="row g-3 mb-3">
          {["col-4", "col-6"].map((w, idx) => (
            <div className="col-12 col-sm-6" key={idx}>
              <div className="ro-section-panel p-3">
                <div className="placeholder-glow mb-2">
                  <span className={`placeholder ${w}`} />
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Tasks + Issue Reports panels */}
        <div className="row g-3 mb-3">
          {[0, 1].map((idx) => (
            <div className="col-12 col-lg-6" key={idx}>
              <div className="ro-section-panel">
                {/* Header strip skeleton */}
                <div className="ro-section-panel-header">
                  <span className="placeholder-glow">
                    <span className="placeholder col-3" />
                  </span>
                </div>
                <div className="p-3">
                  <div className="row g-2">
                    {["col-5", "col-4", "col-6", "col-3"].map((w, i) => (
                      <div className="col-6" key={i}>
                        <div
                          className="p-2 rounded"
                          style={{ backgroundColor: "var(--ro-bg)" }}
                        >
                          <div className="placeholder-glow mb-1">
                            <span className={`placeholder ${w}`} />
                          </div>
                          <div className="placeholder-glow">
                            <span className="placeholder col-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: Quick Actions panel */}
        <div className="ro-section-panel">
          <div className="ro-section-panel-header">
            <span className="placeholder-glow">
              <span className="placeholder col-2" />
            </span>
          </div>
          <div className="p-3 d-flex flex-wrap gap-2">
            {["col-2", "col-2", "col-2", "col-2", "col-2"].map((w, i) => (
              <span key={i} className="placeholder-glow">
                <span className={`placeholder btn ${w}`} />
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Operational summary for your tenant"
          action={refreshAction}
        />

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

  if (!data) {
    return (
      <section>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Operational summary for your tenant"
          action={refreshAction}
        />
        <EmptyState
          icon="bi-speedometer2"
          title="Dashboard unavailable"
          message="Dashboard data is currently unavailable. Please try refreshing."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void reload()}
            >
              Retry
            </button>
          }
        />
      </section>
    );
  }

  const emptyStateModel = getEmptyStateModel(
    data.propertiesCount,
    data.operatorsCount,
  );

  if (emptyStateModel) {
    return (
      <section>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Operational summary for your tenant"
          action={refreshAction}
        />

        <EmptyState
          icon="bi-building"
          title={emptyStateModel.title}
          message={emptyStateModel.message}
          action={
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link
                to={emptyStateModel.primaryCtaTo}
                className="btn btn-primary"
              >
                {emptyStateModel.primaryCtaLabel}
              </Link>
              {/* Show "Create Operator" only when no properties exist — wireframe §7.1 */}
              {emptyStateModel.showSecondaryOperatorCta && (
                <Link
                  to="/admin/operators/new"
                  className="btn btn-outline-secondary"
                >
                  Create Operator
                </Link>
              )}
              <Link to="/admin/tasks/new" className="btn btn-outline-secondary">
                Create Task
              </Link>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Operational summary for your tenant"
        action={refreshAction}
      />

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6">
          {/* Navigable card: clicking takes the admin straight to the property list */}
          <StatCard
            label="Properties"
            value={data.propertiesCount}
            icon="bi-buildings"
            to="/admin/properties"
          />
        </div>
        <div className="col-12 col-sm-6">
          {/* Navigable card: clicking takes the admin straight to the operator list */}
          <StatCard
            label="Operators"
            value={data.operatorsCount}
            icon="bi-people"
            to="/admin/operators"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="ro-section-panel h-100">
            {/* Section header strip — ro-section-panel-header provides the uppercase
                label styling, border-bottom, and bg tint automatically. */}
            <div className="ro-section-panel-header d-flex align-items-center justify-content-between">
              <span>Tasks</span>
              <Link
                to="/admin/tasks"
                className="btn btn-outline-secondary btn-sm"
              >
                View Tasks
              </Link>
            </div>

            <div className="p-3">
              <div className="row g-2">
                <div className="col-6">
                  <StatCard
                    label="Pending"
                    value={data.taskCounts.pending}
                    icon="bi-hourglass-split"
                    flat
                  />
                </div>
                <div className="col-6">
                  <StatCard
                    label="Assigned"
                    value={data.taskCounts.assigned}
                    icon="bi-person-check"
                    flat
                  />
                </div>
                <div className="col-6">
                  {/* Amber accent mirrors the IN_PROGRESS badge colour from the design system */}
                  <StatCard
                    label="In Progress"
                    value={data.taskCounts.inProgress}
                    icon="bi-play-circle"
                    accent="var(--ro-warning)"
                    flat
                  />
                </div>
                <div className="col-6">
                  {/* Green accent mirrors the COMPLETED badge colour */}
                  <StatCard
                    label="Completed"
                    value={data.taskCounts.completed}
                    icon="bi-check-circle"
                    accent="var(--ro-success)"
                    flat
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="ro-section-panel h-100">
            {/* Section header strip — same pattern as Tasks panel above */}
            <div className="ro-section-panel-header d-flex align-items-center justify-content-between">
              <span>Issue Reports</span>
              <Link
                to="/admin/issue-reports"
                className="btn btn-outline-secondary btn-sm"
              >
                View Issue Reports
              </Link>
            </div>

            <div className="p-3">
              <div className="row g-2">
                <div className="col-4">
                  {/* Red accent when there are open reports — signals work needing attention */}
                  <StatCard
                    label="Open"
                    value={data.issueReportCounts.open}
                    icon="bi-exclamation-triangle"
                    accent={
                      data.issueReportCounts.open > 0
                        ? "var(--ro-danger)"
                        : undefined
                    }
                    flat
                  />
                </div>
                <div className="col-4">
                  <StatCard
                    label="Converted"
                    value={data.issueReportCounts.converted}
                    icon="bi-arrow-right-circle"
                    accent="var(--ro-success)"
                    flat
                  />
                </div>
                <div className="col-4">
                  <StatCard
                    label="Dismissed"
                    value={data.issueReportCounts.dismissed}
                    icon="bi-x-circle"
                    flat
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ro-section-panel">
        {/* ro-section-panel-header gives the "Quick Actions" strip the same
            uppercase label treatment as the Tasks and Issue Reports panels. */}
        <div className="ro-section-panel-header">Quick Actions</div>
        <div className="p-3 d-flex flex-wrap gap-2">
          <Link to="/admin/operators" className="btn btn-outline-secondary">
            <i className="bi bi-people me-2" aria-hidden="true" />
            View Team
          </Link>
          <Link to="/admin/properties" className="btn btn-outline-secondary">
            <i className="bi bi-buildings me-2" aria-hidden="true" />
            View Properties
          </Link>
          <Link to="/admin/tasks" className="btn btn-outline-secondary">
            <i className="bi bi-list-task me-2" aria-hidden="true" />
            View Tasks
          </Link>
          <Link to="/admin/issue-reports" className="btn btn-outline-secondary">
            <i className="bi bi-flag me-2" aria-hidden="true" />
            View Issue Reports
          </Link>
          <Link to="/admin/tasks/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" aria-hidden="true" />
            Create Task
          </Link>
        </div>
      </div>
    </section>
  );
}

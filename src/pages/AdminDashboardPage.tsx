// AdminDashboardPage.tsx
// Admin landing page showing tenant-level operational counters.
//
// Why this page exists:
//   The dashboard gives Admin users an immediate snapshot of workload health
//   and clear next actions, so they can decide where to navigate first.

import { Link } from "react-router-dom";
import { useAdminSummary } from "@/features/dashboard/hooks/useAdminSummary";
import { useTeamHealth } from "@/features/dashboard/hooks/useTeamHealth";
import { useRecentOpenIssueReports } from "@/features/dashboard/hooks/useRecentOpenIssueReports";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";

const ATTENTION_PENDING_BACKLOG_THRESHOLD = 5;

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

interface AttentionSignal {
  key:
    | "open-issue-reports"
    | "no-active-operators"
    | "no-properties"
    | "task-backlog";
  title: string;
  message: string;
  ctaLabel: string;
  to: string;
  accent: string;
}

interface QuickAction {
  key:
    | "create-property"
    | "create-operator"
    | "view-team"
    | "view-issue-reports"
    | "view-tasks"
    | "create-task";
  label: string;
  to: string;
  icon: string;
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
  const {
    data: teamHealth,
    loading: teamHealthLoading,
    error: teamHealthError,
    reload: reloadTeamHealth,
  } = useTeamHealth();
  const {
    data: recentOpenReports,
    loading: recentOpenReportsLoading,
    error: recentOpenReportsError,
    reload: reloadRecentOpenReports,
  } = useRecentOpenIssueReports();

  // Keep dashboard sections aligned by refreshing both data blocks from one action.
  const handleRefresh = () => {
    void Promise.all([reload(), reloadTeamHealth(), reloadRecentOpenReports()]);
  };

  const refreshAction = (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={handleRefresh}
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

  // Keep Team Health state handling local to this panel so summary cards remain usable
  // even if the operators call fails independently.
  let teamHealthContent: React.ReactNode;

  if (teamHealthLoading) {
    teamHealthContent = (
      <div className="row g-2">
        {["col-4", "col-4", "col-5", "col-4", "col-4", "col-6"].map((w, i) => (
          <div className="col-6 col-md-4" key={i}>
            <div
              className="p-2 rounded"
              style={{ backgroundColor: "var(--ro-bg)" }}
            >
              <div className="placeholder-glow mb-1">
                <span className={`placeholder ${w}`} />
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (teamHealthError) {
    teamHealthContent = (
      <div className="alert alert-danger mb-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>{teamHealthError}</span>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => void reloadTeamHealth()}
        >
          Retry
        </button>
      </div>
    );
  } else if (!teamHealth) {
    teamHealthContent = (
      <div className="alert alert-warning mb-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>Team health data is currently unavailable.</span>
        <button
          type="button"
          className="btn btn-outline-warning btn-sm"
          onClick={() => void reloadTeamHealth()}
        >
          Retry
        </button>
      </div>
    );
  } else if (teamHealth.activeOperators + teamHealth.disabledOperators === 0) {
    teamHealthContent = (
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <p className="mb-0" style={{ color: "var(--ro-text-muted)" }}>
          No operators found yet.
        </p>
        <Link
          to="/admin/operators/new"
          className="btn btn-outline-secondary btn-sm"
        >
          Create Operator
        </Link>
      </div>
    );
  } else {
    teamHealthContent = (
      <>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <StatCard
              label="Active Operators"
              value={teamHealth.activeOperators}
              icon="bi-person-check"
              accent="var(--ro-success)"
              flat
            />
          </div>
          <div className="col-6">
            <StatCard
              label="Disabled Operators"
              value={teamHealth.disabledOperators}
              icon="bi-person-x"
              accent="var(--ro-danger)"
              flat
            />
          </div>
        </div>

        <p
          className="mb-2 d-flex align-items-center gap-2"
          style={{ color: "var(--ro-text-muted)", fontSize: "0.85rem" }}
        >
          <i className="bi bi-grid" aria-hidden="true" />
          Specialization Breakdown
        </p>

        <div className="row g-2">
          <div className="col-6 col-md-3">
            <StatCard
              label="CLEANING"
              value={teamHealth.specializationBreakdown.CLEANING}
              flat
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              label="PLUMBING"
              value={teamHealth.specializationBreakdown.PLUMBING}
              flat
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              label="ELECTRICAL"
              value={teamHealth.specializationBreakdown.ELECTRICAL}
              flat
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              label="GENERAL_MAINTENANCE"
              value={teamHealth.specializationBreakdown.GENERAL_MAINTENANCE}
              flat
            />
          </div>
        </div>
      </>
    );
  }

  let recentOpenReportsContent: React.ReactNode;

  if (recentOpenReportsLoading) {
    recentOpenReportsContent = (
      <div className="row g-2">
        {[0, 1, 2].map((i) => (
          <div className="col-12" key={i}>
            <div
              className="p-2 rounded"
              style={{ backgroundColor: "var(--ro-bg)" }}
            >
              <div className="placeholder-glow mb-1">
                <span className="placeholder col-4" />
              </div>
              <div className="placeholder-glow mb-1">
                <span className="placeholder col-8" />
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (recentOpenReportsError) {
    recentOpenReportsContent = (
      <div className="alert alert-danger mb-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>{recentOpenReportsError}</span>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => void reloadRecentOpenReports()}
        >
          Retry
        </button>
      </div>
    );
  } else if (!recentOpenReports) {
    recentOpenReportsContent = (
      <div className="alert alert-warning mb-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>Open issue report preview is currently unavailable.</span>
        <button
          type="button"
          className="btn btn-outline-warning btn-sm"
          onClick={() => void reloadRecentOpenReports()}
        >
          Retry
        </button>
      </div>
    );
  } else if (recentOpenReports.length === 0) {
    recentOpenReportsContent = (
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <p className="mb-0" style={{ color: "var(--ro-text-muted)" }}>
          No open issue reports right now.
        </p>
        <Link
          to="/admin/issue-reports"
          className="btn btn-outline-secondary btn-sm"
        >
          View Issue Reports
        </Link>
      </div>
    );
  } else {
    recentOpenReportsContent = (
      <div className="d-flex flex-column gap-2">
        {recentOpenReports.map((report) => (
          <div
            key={report.id}
            className="p-2 rounded"
            style={{ backgroundColor: "var(--ro-bg)" }}
          >
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-1">
              <p className="mb-0 fw-semibold">{report.propertyName}</p>
              <small style={{ color: "var(--ro-text-muted)" }}>
                {new Date(report.createdAt).toLocaleDateString()}
              </small>
            </div>

            <p
              className="mb-1"
              style={{ color: "var(--ro-text-muted)", fontSize: "0.85rem" }}
            >
              Reported by {report.reportedByUserName}
            </p>

            <p className="mb-2" style={{ fontSize: "0.9rem" }}>
              {report.description.length > 110
                ? `${report.description.slice(0, 110)}...`
                : report.description}
            </p>

            <Link
              to={`/admin/issue-reports/${report.id}/convert`}
              className="btn btn-outline-secondary btn-sm"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    );
  }

  const attentionSignals: AttentionSignal[] = [];

  if (data.issueReportCounts.open > 0) {
    attentionSignals.push({
      key: "open-issue-reports",
      title: "Open issue reports need review",
      message: `${data.issueReportCounts.open} open report${data.issueReportCounts.open === 1 ? "" : "s"} waiting for admin action.`,
      ctaLabel: "Review Issue Reports",
      to: "/admin/issue-reports",
      accent: "var(--ro-danger)",
    });
  }

  if (teamHealth && teamHealth.activeOperators === 0) {
    attentionSignals.push({
      key: "no-active-operators",
      title: "No active operators available",
      message: "Activate or add operators before assigning operational work.",
      ctaLabel: "View Team",
      to: "/admin/operators",
      accent: "var(--ro-danger)",
    });
  }

  if (data.propertiesCount === 0) {
    attentionSignals.push({
      key: "no-properties",
      title: "No properties created yet",
      message:
        "Create at least one property to enable tasks and issue reports.",
      ctaLabel: "Create Property",
      to: "/admin/properties/new",
      accent: "var(--ro-warning)",
    });
  }

  if (data.taskCounts.pending >= ATTENTION_PENDING_BACKLOG_THRESHOLD) {
    attentionSignals.push({
      key: "task-backlog",
      title: "Task backlog needs attention",
      message: `${data.taskCounts.pending} pending tasks (threshold: ${ATTENTION_PENDING_BACKLOG_THRESHOLD}).`,
      ctaLabel: "View Tasks",
      to: "/admin/tasks",
      accent: "var(--ro-warning)",
    });
  }

  let attentionNeededContent: React.ReactNode;

  if (attentionSignals.length === 0) {
    attentionNeededContent = (
      <div
        className="d-flex align-items-center gap-2"
        style={{ color: "var(--ro-text-muted)" }}
      >
        <i className="bi bi-check-circle" aria-hidden="true" />
        <span>No immediate attention needed.</span>
      </div>
    );
  } else {
    attentionNeededContent = (
      <div className="d-flex flex-column gap-2">
        {attentionSignals.map((signal) => (
          <div
            key={signal.key}
            className="p-2 rounded"
            style={{
              backgroundColor: "var(--ro-bg)",
              borderLeft: `3px solid ${signal.accent}`,
            }}
          >
            <p className="mb-1 fw-semibold">{signal.title}</p>
            <p
              className="mb-2"
              style={{ color: "var(--ro-text-muted)", fontSize: "0.9rem" }}
            >
              {signal.message}
            </p>
            <Link to={signal.to} className="btn btn-outline-secondary btn-sm">
              {signal.ctaLabel}
            </Link>
          </div>
        ))}
      </div>
    );
  }

  // Keep Quick Actions deterministic: one primary action based on current state,
  // then a stable secondary list to preserve muscle memory.
  const quickActions: QuickAction[] = [
    {
      key: "create-property",
      label: "Create Property",
      to: "/admin/properties/new",
      icon: "bi-buildings",
    },
    {
      key: "create-operator",
      label: "Create Operator",
      to: "/admin/operators/new",
      icon: "bi-person-plus",
    },
    {
      key: "view-team",
      label: "View Team",
      to: "/admin/operators",
      icon: "bi-people",
    },
    {
      key: "view-issue-reports",
      label: "View Issue Reports",
      to: "/admin/issue-reports",
      icon: "bi-flag",
    },
    {
      key: "view-tasks",
      label: "View Tasks",
      to: "/admin/tasks",
      icon: "bi-list-task",
    },
    {
      key: "create-task",
      label: "Create Task",
      to: "/admin/tasks/new",
      icon: "bi-plus-lg",
    },
  ];

  let primaryQuickActionKey: QuickAction["key"] = "create-task";

  if (data.propertiesCount === 0) {
    primaryQuickActionKey = "create-property";
  } else if (teamHealth && teamHealth.activeOperators === 0) {
    primaryQuickActionKey = "create-operator";
  } else if (data.issueReportCounts.open > 0) {
    primaryQuickActionKey = "view-issue-reports";
  } else if (data.taskCounts.pending >= ATTENTION_PENDING_BACKLOG_THRESHOLD) {
    primaryQuickActionKey = "view-tasks";
  }

  const primaryQuickAction =
    quickActions.find((action) => action.key === primaryQuickActionKey) ??
    quickActions[quickActions.length - 1];

  const secondaryQuickActions = quickActions
    .filter((action) => action.key !== primaryQuickAction.key)
    .slice(0, 4);

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

      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="ro-section-panel h-100">
            <div className="ro-section-panel-header d-flex align-items-center justify-content-between">
              <span>Team Health</span>
              <Link
                to="/admin/operators"
                className="btn btn-outline-secondary btn-sm"
              >
                View Team
              </Link>
            </div>

            <div className="p-3">{teamHealthContent}</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="ro-section-panel h-100">
            <div className="ro-section-panel-header d-flex align-items-center justify-content-between">
              <span>Recent Open Issue Reports</span>
              <Link
                to="/admin/issue-reports"
                className="btn btn-outline-secondary btn-sm"
              >
                View All
              </Link>
            </div>

            <div className="p-3">{recentOpenReportsContent}</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="ro-section-panel h-100">
            <div className="ro-section-panel-header">Attention Needed</div>

            <div className="p-3">{attentionNeededContent}</div>
          </div>
        </div>
      </div>

      <div className="ro-section-panel">
        {/* ro-section-panel-header gives the "Quick Actions" strip the same
            uppercase label treatment as the Tasks and Issue Reports panels. */}
        <div className="ro-section-panel-header">Quick Actions</div>
        <div className="p-3 d-flex flex-column gap-2">
          <Link to={primaryQuickAction.to} className="btn btn-primary">
            <i
              className={`bi ${primaryQuickAction.icon} me-2`}
              aria-hidden="true"
            />
            {primaryQuickAction.label}
          </Link>

          <div className="d-flex flex-wrap gap-2">
            {secondaryQuickActions.map((action) => (
              <Link
                key={action.key}
                to={action.to}
                className="btn btn-outline-secondary"
              >
                <i className={`bi ${action.icon} me-2`} aria-hidden="true" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// index.ts
// Types for the Admin dashboard summary payload.
//
// Why this file exists:
//   The dashboard endpoint returns a compact aggregate object; keeping it typed
//   in one place prevents shape drift between API, hooks, and page rendering.

// Represents task counters grouped by workflow status.
export interface DashboardTaskCounts {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

// Represents issue report counters grouped by review outcome.
export interface DashboardIssueReportCounts {
  open: number;
  converted: number;
  dismissed: number;
}

// Contract for GET /dashboard/admin-summary.
// Field names must remain exactly aligned with the backend DTO.
export interface AdminDashboardSummary {
  propertiesCount: number;
  operatorsCount: number;
  taskCounts: DashboardTaskCounts;
  issueReportCounts: DashboardIssueReportCounts;
}

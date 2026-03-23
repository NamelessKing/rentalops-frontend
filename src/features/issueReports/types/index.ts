// types/index.ts — Issue Reports feature type definitions
//
// All types mirror the backend contract from SLICE5_FRONTEND_HANDOFF.md exactly.
// Field names are kept as-is to avoid silent drift during API integration.

// ─── Enum types ───────────────────────────────────────────────────────────────

// The three possible lifecycle states of an issue report.
// OPEN    → just created, awaiting Admin review
// CONVERTED → Admin turned it into a task
// DISMISSED → Admin archived it without creating a task
export type IssueReportStatus = "OPEN" | "CONVERTED" | "DISMISSED";

// ─── Response shapes ─────────────────────────────────────────────────────────

// Row shape returned by GET /issue-reports (Admin list view).
// propertyName and reportedByUserName are already resolved server-side.
export interface IssueReportListItem {
  id: string;
  propertyId: string;
  propertyName: string;
  reportedByUserId: string;
  reportedByUserName: string;
  description: string;
  status: IssueReportStatus;
  createdAt: string; // ISO 8601
}

// Full shape returned by GET /issue-reports/{id} (Admin detail view).
// reviewedByUserId and reviewedAt are null while the report is still OPEN.
export interface IssueReportDetail {
  id: string;
  propertyId: string;
  propertyName: string;
  reportedByUserId: string;
  reportedByUserName: string;
  description: string;
  status: IssueReportStatus;
  createdAt: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null; // ISO 8601, null while OPEN
}

// Minimal response shape returned by POST /issue-reports (201 Created).
// Status is always OPEN at creation time.
export interface CreateIssueReportResponse {
  id: string;
  propertyId: string;
  reportedByUserId: string;
  description: string;
  status: "OPEN";
}

// Response returned by PATCH /issue-reports/{id}/convert-to-task (200 OK).
// Contains both the updated report stub and the newly created task stub.
export interface ConvertIssueReportResponse {
  issueReport: {
    id: string;
    status: "CONVERTED";
  };
  task: {
    id: string;
    status: "PENDING" | "ASSIGNED";
    dispatchMode: "POOL" | "DIRECT_ASSIGNMENT";
    sourceIssueReportId: string;
  };
}

// Response returned by PATCH /issue-reports/{id}/dismiss (200 OK).
export interface DismissIssueReportResponse {
  id: string;
  status: "DISMISSED";
}

// ─── Request shapes ───────────────────────────────────────────────────────────

// POST /issue-reports request body.
// The tenant is always derived from the JWT — never sent in the body.
export interface CreateIssueReportRequest {
  propertyId: string; // UUID of the property being reported
  description: string; // Max 2000 characters
}

// PATCH /issue-reports/{id}/convert-to-task request body.
//
// Important notes from the backend contract:
//   - propertyId is NOT included — it is inherited from the source report
//   - assigneeId is required when dispatchMode === "DIRECT_ASSIGNMENT"
//   - assigneeId must be null/omitted when dispatchMode === "POOL"
export interface ConvertIssueReportRequest {
  category: "CLEANING" | "PLUMBING" | "ELECTRICAL" | "GENERAL_MAINTENANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string; // Max 255 characters
  description?: string; // Max 2000 characters, optional
  dispatchMode: "POOL" | "DIRECT_ASSIGNMENT";
  assigneeId?: string | null; // Required for DIRECT_ASSIGNMENT, must be null for POOL
  estimatedHours?: number;
}

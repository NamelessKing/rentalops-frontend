// issueReportsApi.ts
// HTTP functions for the issue report domain endpoints.
//
// Why this file exists:
//   Centralise endpoint paths and response wiring so hooks and pages
//   can focus on UI state without knowing the HTTP layer details.
//
// Pattern mirrors tasksApi.ts — one function per endpoint, typed in/out.

import apiClient from "@/shared/api/apiClient";
import type {
  ConvertIssueReportRequest,
  ConvertIssueReportResponse,
  CreateIssueReportRequest,
  CreateIssueReportResponse,
  DismissIssueReportResponse,
  IssueReportDetail,
  IssueReportListItem,
} from "../types";

// GET /issue-reports — Admin: returns all issue reports for the current tenant.
// Ordered by createdAt descending (most recent first) — server-side.
export async function fetchIssueReports(): Promise<IssueReportListItem[]> {
  const res = await apiClient.get<IssueReportListItem[]>("/issue-reports");
  return res.data;
}

// GET /issue-reports/{id} — Admin: full detail of a single issue report.
// Returns reviewedByUserId and reviewedAt populated once the report is reviewed.
export async function fetchIssueReport(id: string): Promise<IssueReportDetail> {
  const res = await apiClient.get<IssueReportDetail>(`/issue-reports/${id}`);
  return res.data;
}

// POST /issue-reports — Operator: create a new issue report from the field.
// Returns 201 Created with the new report (status always "OPEN").
export async function createIssueReport(
  body: CreateIssueReportRequest,
): Promise<CreateIssueReportResponse> {
  const res = await apiClient.post<CreateIssueReportResponse>(
    "/issue-reports",
    body,
  );
  return res.data;
}

// PATCH /issue-reports/{id}/convert-to-task — Admin: convert an OPEN report into a task.
// Returns 200 with both the updated report stub and the created task stub.
// Note: propertyId is NOT in the body — inherited from the source report automatically.
export async function convertIssueReport(
  id: string,
  body: ConvertIssueReportRequest,
): Promise<ConvertIssueReportResponse> {
  const res = await apiClient.patch<ConvertIssueReportResponse>(
    `/issue-reports/${id}/convert-to-task`,
    body,
  );
  return res.data;
}

// PATCH /issue-reports/{id}/dismiss — Admin: archive an OPEN report as DISMISSED.
// No request body required. Returns 200 with the updated report stub.
export async function dismissIssueReport(
  id: string,
): Promise<DismissIssueReportResponse> {
  const res = await apiClient.patch<DismissIssueReportResponse>(
    `/issue-reports/${id}/dismiss`,
  );
  return res.data;
}

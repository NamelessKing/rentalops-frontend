// dashboardApi.ts
// HTTP functions for dashboard endpoints.
//
// Why this file exists:
//   It isolates endpoint paths and response typing from UI orchestration, so
//   pages and hooks stay focused on state and rendering concerns.

import apiClient from "@/shared/api/apiClient";
import type { AdminDashboardSummary } from "../types";

// GET /dashboard/admin-summary — Admin-only aggregate counters for MVP dashboard.
export async function fetchAdminSummary(): Promise<AdminDashboardSummary> {
  const res = await apiClient.get<AdminDashboardSummary>(
    "/dashboard/admin-summary",
  );
  return res.data;
}

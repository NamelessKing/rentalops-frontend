// tasksApi.ts
// HTTP functions for the task domain endpoints.
//
// Why this file exists:
// Centralise endpoint paths and response wiring so hooks and pages
// can focus on UI state without knowing the HTTP layer details.

import apiClient from "@/shared/api/apiClient";
import type {
  CreateTaskRequest,
  MyTaskItem,
  TaskDetailResponse,
  TaskListItem,
  TaskPoolItem,
} from "../types";

// GET /tasks — Admin: returns all tenant-scoped tasks.
// Tenant isolation is enforced by the backend from the JWT — no tenant field sent.
export async function fetchTasks(): Promise<TaskListItem[]> {
  const res = await apiClient.get<TaskListItem[]>("/tasks");
  return res.data;
}

// GET /tasks/{id} — Admin (any task in tenant) or Operator (own tasks only, 403 otherwise).
export async function fetchTask(id: string): Promise<TaskDetailResponse> {
  const res = await apiClient.get<TaskDetailResponse>(`/tasks/${id}`);
  return res.data;
}

// POST /tasks — Admin: create a POOL or DIRECT_ASSIGNMENT task.
// Response shape is TaskDetailResponse (same as GET /tasks/{id}).
// Use the returned id to redirect to the detail page without a second GET.
export async function createTask(
  body: CreateTaskRequest,
): Promise<TaskDetailResponse> {
  const res = await apiClient.post<TaskDetailResponse>("/tasks", body);
  return res.data;
}

// GET /tasks/pool — Operator: PENDING pool tasks matching the operator's specialization.
// Backend applies the category filter automatically — no client-side filtering needed.
export async function fetchTaskPool(): Promise<TaskPoolItem[]> {
  const res = await apiClient.get<TaskPoolItem[]>("/tasks/pool");
  return res.data;
}

// GET /tasks/my — Operator: tasks assigned to the authenticated operator.
export async function fetchMyTasks(): Promise<MyTaskItem[]> {
  const res = await apiClient.get<MyTaskItem[]>("/tasks/my");
  return res.data;
}

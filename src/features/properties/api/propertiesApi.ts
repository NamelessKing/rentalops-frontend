// propertiesApi.ts
// HTTP functions for Slice 2 property endpoints.
//
// Why this file exists:
// Keep endpoint paths and request/response wiring centralized so pages/hooks
// can focus on UI flow and state transitions.

import apiClient from "@/shared/api/apiClient";
import type {
  CreatePropertyRequest,
  PropertyDetailResponse,
  PropertyListItem,
  UpdatePropertyRequest,
} from "../types";

// Calls GET /properties and returns tenant-scoped property rows.
export async function fetchProperties(): Promise<PropertyListItem[]> {
  const res = await apiClient.get<PropertyListItem[]>("/properties");
  return res.data;
}

// Calls POST /properties and returns the created property detail.
export async function createProperty(
  body: CreatePropertyRequest,
): Promise<PropertyDetailResponse> {
  const res = await apiClient.post<PropertyDetailResponse>("/properties", body);
  return res.data;
}

// Calls GET /properties/{id} and returns full property detail.
export async function fetchPropertyDetail(
  id: string,
): Promise<PropertyDetailResponse> {
  const res = await apiClient.get<PropertyDetailResponse>(`/properties/${id}`);
  return res.data;
}

// Calls PUT /properties/{id} and returns updated property detail.
export async function updateProperty(
  id: string,
  body: UpdatePropertyRequest,
): Promise<PropertyDetailResponse> {
  const res = await apiClient.put<PropertyDetailResponse>(
    `/properties/${id}`,
    body,
  );
  return res.data;
}

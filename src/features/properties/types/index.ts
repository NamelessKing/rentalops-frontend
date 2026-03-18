// types/index.ts — Properties feature type definitions
//
// These types mirror Slice 2 backend contracts for property management.
// Keeping field names exact avoids frontend/backend drift during integration.

// Row shape returned by GET /properties.
// This lightweight shape is ideal for table/list views.
export interface PropertyListItem {
  id: string;
  propertyCode: string;
  name: string;
  city: string;
  active: boolean;
}

// Shared detail shape used by create/detail/update responses.
// Backend normalizes propertyCode to uppercase before returning it.
export interface PropertyDetailResponse {
  id: string;
  propertyCode: string;
  name: string;
  address: string;
  city: string;
  notes?: string;
  active: boolean;
}

// Request body for POST /properties.
export interface CreatePropertyRequest {
  propertyCode: string;
  name: string;
  address: string;
  city: string;
  notes?: string;
}

// Request body for PUT /properties/{id}.
// PUT is full replacement in this project, so all core fields are present.
export interface UpdatePropertyRequest {
  propertyCode: string;
  name: string;
  address: string;
  city: string;
  notes?: string;
}

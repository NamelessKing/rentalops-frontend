// usePropertyDetail.ts
// Orchestrates detail fetch and update flow for a single property.
//
// Why this hook exists:
// Keep page components focused on rendering while this hook centralizes
// async lifecycle, backend error mapping, and success feedback.

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchPropertyDetail, updateProperty } from "../api/propertiesApi";
import type { PropertyDetailResponse, UpdatePropertyRequest } from "../types";

interface ProblemDetailLike {
  detail?: string;
}

// Loads one property by id and exposes save behavior for edit mode.
export function usePropertyDetail(propertyId: string | undefined) {
  const [data, setData] = useState<PropertyDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertyId) {
      setError("Missing property id in route.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detail = await fetchPropertyDetail(propertyId);
      setData(detail);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        if (status === 403) {
          setError("You are not allowed to view this property.");
          return;
        }

        if (status === 404) {
          setError("Property not found in your tenant.");
          return;
        }
      }

      setError("Unable to load property details right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  // Fetch once when route id changes so the page always reflects current entity.
  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (
      body: UpdatePropertyRequest,
    ): Promise<PropertyDetailResponse | null> => {
      if (!propertyId) {
        setSaveError("Missing property id in route.");
        return null;
      }

      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      try {
        const updated = await updateProperty(propertyId, body);
        setData(updated);
        setSaveSuccess("Property updated successfully.");
        return updated;
      } catch (err) {
        if (axios.isAxiosError<ProblemDetailLike>(err)) {
          const status = err.response?.status;
          const detail = err.response?.data?.detail;

          if (status === 400) {
            setSaveError(
              detail || "Validation error: check all required fields.",
            );
            return null;
          }

          if (status === 401) {
            setSaveError("Your session expired. Please sign in again.");
            return null;
          }

          if (status === 403) {
            setSaveError("Only admins can update properties.");
            return null;
          }

          if (status === 404) {
            setSaveError("Property no longer exists in your tenant.");
            return null;
          }

          if (status === 409) {
            setSaveError(detail || "This property code is already in use.");
            return null;
          }
        }

        setSaveError(
          "Unexpected error while saving property. Please try again.",
        );
        return null;
      } finally {
        setSaving(false);
      }
    },
    [propertyId],
  );

  return {
    data,
    loading,
    error,
    reload: load,
    saving,
    saveError,
    saveSuccess,
    save,
  };
}

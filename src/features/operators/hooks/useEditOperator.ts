// useEditOperator.ts
// Custom hook that manages all async state for the Edit Operator page.
//
// Why this hook exists:
// Separates network concerns (fetch, save, toggle status) from UI rendering,
// following the same pattern used by usePropertyDetail.ts.
// The page component stays focused on rendering and user interaction.

import { useState, useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  fetchOperators,
  updateOperator,
  disableOperator,
  enableOperator,
} from "../api/operatorsApi";
import type {
  OperatorListItem,
  UpdateOperatorRequest,
  SpecializationCategory,
} from "../types";

// The mutable fields shown in the edit form.
// newPassword is a plain string: empty means "don't change the password".
export interface OperatorFormDraft {
  fullName: string;
  email: string;
  newPassword: string;
  specializationCategory: SpecializationCategory;
}

// Public shape of what the hook returns to the page component.
export interface UseEditOperatorResult {
  data: OperatorListItem | null;
  loading: boolean;
  error: string | null;
  draft: OperatorFormDraft;
  setDraft: Dispatch<SetStateAction<OperatorFormDraft>>;
  save: () => Promise<void>;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  toggleStatus: () => Promise<void>;
  toggling: boolean;
  toggleError: string | null;
}

// Maps Axios HTTP status codes to readable messages for save failures.
function mapSaveError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const status = (err as { response: { status: number } }).response.status;
    if (status === 400) return "Invalid data. Please check all fields.";
    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403) return "You do not have permission to edit operators.";
    if (status === 404) return "Operator not found.";
    if (status === 409) return "This email is already in use by another user.";
  }
  return "An unexpected error occurred. Please try again.";
}

// Maps Axios HTTP status codes to readable messages for disable/enable failures.
function mapToggleError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const status = (err as { response: { status: number } }).response.status;
    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403)
      return "You do not have permission to change operator status.";
    if (status === 404) return "Operator not found.";
  }
  return "An unexpected error occurred. Please try again.";
}

// Manages the Edit Operator page lifecycle.
//
// operatorId: UUID from the route param (:operatorId).
// initialOperator: optional data passed via React Router location.state from
//   the list page — avoids an extra API call when navigating via the Edit link.
export function useEditOperator(
  operatorId: string,
  initialOperator?: OperatorListItem,
): UseEditOperatorResult {
  // Local copy of the operator — kept in sync with server after save or toggle.
  const [data, setData] = useState<OperatorListItem | null>(
    initialOperator ?? null,
  );

  // Skip the loading phase when initial data was provided via navigation state.
  const [loading, setLoading] = useState(!initialOperator);
  const [error, setError] = useState<string | null>(null);

  // Draft holds the current form values.
  // Seeded from initialOperator if available, otherwise populated after fetch.
  const [draft, setDraft] = useState<OperatorFormDraft>({
    fullName: initialOperator?.fullName ?? "",
    email: initialOperator?.email ?? "",
    newPassword: "",
    specializationCategory:
      initialOperator?.specializationCategory ?? "CLEANING",
  });

  // Save (PUT) operation state.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Disable/Enable toggle state.
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Fallback fetch: loads the operator list and finds the matching ID.
  // This runs when the user navigates directly to the edit URL (no location.state).
  const loadFromList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const operators = await fetchOperators();
      const found = operators.find((o) => o.id === operatorId) ?? null;
      if (!found) {
        setError("Operator not found.");
        return;
      }
      setData(found);
      setDraft({
        fullName: found.fullName,
        email: found.email,
        newPassword: "",
        specializationCategory: found.specializationCategory,
      });
    } catch {
      setError("Failed to load operator details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [operatorId]);

  // Only run the fallback fetch if no initial data was passed from the list.
  useEffect(() => {
    if (!initialOperator) {
      void loadFromList();
    }
  }, [initialOperator, loadFromList]);

  // Submits the updated operator via PUT.
  // newPassword is included in the payload only if the admin typed something.
  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const body: UpdateOperatorRequest = {
        fullName: draft.fullName,
        email: draft.email,
        specializationCategory: draft.specializationCategory,
        // Omit newPassword entirely when blank — backend keeps the existing one.
        ...(draft.newPassword.trim() ? { newPassword: draft.newPassword } : {}),
      };
      const updated = await updateOperator(data.id, body);
      // Sync local state with the server response to keep badge and fields accurate.
      setData({
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        status: updated.status,
        specializationCategory: updated.specializationCategory,
      });
      // Clear the password field after a successful save so it doesn't linger.
      setDraft((prev) => ({ ...prev, newPassword: "" }));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(mapSaveError(err));
    } finally {
      setSaving(false);
    }
  }, [data, draft]);

  // Toggles the operator's status: ACTIVE → DISABLED or DISABLED → ACTIVE.
  // The badge on the page updates immediately from the server response.
  const toggleStatus = useCallback(async () => {
    if (!data) return;
    setToggling(true);
    setToggleError(null);
    try {
      if (data.status === "ACTIVE") {
        const res = await disableOperator(data.id);
        setData((prev) => (prev ? { ...prev, status: res.status } : prev));
      } else {
        const res = await enableOperator(data.id);
        setData((prev) => (prev ? { ...prev, status: res.status } : prev));
      }
    } catch (err) {
      setToggleError(mapToggleError(err));
    } finally {
      setToggling(false);
    }
  }, [data]);

  return {
    data,
    loading,
    error,
    draft,
    setDraft,
    save,
    saving,
    saveError,
    saveSuccess,
    toggleStatus,
    toggling,
    toggleError,
  };
}

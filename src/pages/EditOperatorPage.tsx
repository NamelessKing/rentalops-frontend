// EditOperatorPage.tsx
// Admin page for editing an existing operator's profile.
//
// Route:  /admin/operators/:operatorId/edit
// Access: ADMIN only
//
// Why this page exists:
// Allows the Admin to update an operator's name, email, specialization, and
// optionally reset their password. It also provides inline disable/enable toggle.
// Data is pre-populated from the operator passed via navigation state when coming
// from the list, or fetched from the API as a fallback.

import { useParams, Link, useLocation, Navigate } from "react-router-dom";
import { useEditOperator } from "@/features/operators/hooks/useEditOperator";
import type {
  OperatorListItem,
  SpecializationCategory,
} from "@/features/operators/types";

// Shape of the optional state passed from OperatorListPage via the Edit link.
// Sending it here avoids a redundant API call on normal navigation.
interface EditOperatorLocationState {
  operator?: OperatorListItem;
}

export function EditOperatorPage() {
  const { operatorId } = useParams<{ operatorId: string }>();
  const location = useLocation();

  // Recover operator data from navigation state (set when clicking Edit in the list).
  const initialOperator = (location.state as EditOperatorLocationState | null)
    ?.operator;

  const {
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
  } = useEditOperator(operatorId ?? "", initialOperator);

  // If the operator ID was not found after loading, redirect to the list.
  if (!loading && error === "Operator not found.") {
    return <Navigate to="/admin/operators" replace />;
  }

  if (loading) {
    return (
      <section aria-live="polite">
        <h1 className="h4 mb-3">Edit Operator</h1>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading operator details...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <h1 className="h4 mb-3">Edit Operator</h1>
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/operators" className="btn btn-outline-secondary">
          Back to Team
        </Link>
      </section>
    );
  }

  // At this point data is guaranteed non-null (loading done, no error).
  if (!data) return null;

  // isActive drives both the badge colour and the disable/enable CTA label.
  const isActive = data.status === "ACTIVE";

  return (
    <section>
      {/* Page header with back navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Edit Operator</h1>
        <Link
          to="/admin/operators"
          className="btn btn-outline-secondary btn-sm"
        >
          Back to Team
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {/* Read-only status badge — updates immediately after toggle */}
          <div className="mb-3">
            <span className="text-muted me-2">Status:</span>
            <span
              className={`badge ${
                isActive ? "text-bg-success" : "text-bg-secondary"
              }`}
            >
              {data.status}
            </span>
          </div>

          {/* Feedback alerts — only one should be visible at a time */}
          {saveSuccess && (
            <div className="alert alert-success py-2" role="status">
              Operator updated successfully.
            </div>
          )}
          {saveError && (
            <div className="alert alert-danger py-2" role="alert">
              {saveError}
            </div>
          )}
          {toggleError && (
            <div className="alert alert-warning py-2" role="alert">
              {toggleError}
            </div>
          )}

          {/* Edit form — fields pre-populated from current operator data */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            noValidate
          >
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                className="form-control"
                value={draft.fullName}
                onChange={(e) =>
                  setDraft({ ...draft, fullName: e.target.value })
                }
                required
                disabled={saving || toggling}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
                disabled={saving || toggling}
              />
            </div>

            {/* Password is always optional on edit — blank means keep existing */}
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                value={draft.newPassword}
                placeholder="Leave blank to keep current password"
                onChange={(e) =>
                  setDraft({ ...draft, newPassword: e.target.value })
                }
                disabled={saving || toggling}
              />
              <div className="form-text">
                Leave blank to keep the existing password unchanged.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="specializationCategory" className="form-label">
                Specialization
              </label>
              <select
                id="specializationCategory"
                className="form-select"
                value={draft.specializationCategory}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    specializationCategory: e.target
                      .value as SpecializationCategory,
                  })
                }
                disabled={saving || toggling}
              >
                <option value="CLEANING">CLEANING</option>
                <option value="PLUMBING">PLUMBING</option>
                <option value="ELECTRICAL">ELECTRICAL</option>
                <option value="GENERAL_MAINTENANCE">GENERAL_MAINTENANCE</option>
              </select>
            </div>

            {/* Primary CTA: save form + secondary CTA: toggle status */}
            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || toggling}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Disable/Enable button — label and colour change based on current status */}
              <button
                type="button"
                className={`btn ${
                  isActive ? "btn-outline-danger" : "btn-outline-success"
                }`}
                onClick={() => void toggleStatus()}
                disabled={saving || toggling}
              >
                {toggling
                  ? "Updating..."
                  : isActive
                    ? "Disable Operator"
                    : "Enable Operator"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

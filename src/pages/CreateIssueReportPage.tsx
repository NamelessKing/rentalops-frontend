// CreateIssueReportPage.tsx
// Operator-facing form for creating a new issue report from the field.
//
// Route:   /operator/issue-reports/new
// Role:    OPERATOR only (enforced by RequireRole in the router)
// Endpoint: POST /issue-reports
//
// Form fields:
//   - propertyId (select, required) — populated from GET /properties
//   - description (textarea, required, max 2000 characters)
//
// After a successful submit the page redirects to /operator/tasks to keep
// the Operator in their primary work area.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateIssueReport } from "@/features/issueReports/hooks/useCreateIssueReport";
import { PageHeader } from "@/shared/components/PageHeader";

// Maximum description length enforced by the backend (and validated client-side).
const MAX_DESCRIPTION_LENGTH = 2000;

export function CreateIssueReportPage() {
  const navigate = useNavigate();
  const {
    properties,
    loadingProperties,
    propertiesError,
    submitting,
    submitError,
    submit,
  } = useCreateIssueReport();

  // Controlled form state — two fields as per the API contract.
  const [propertyId, setPropertyId] = useState("");
  const [description, setDescription] = useState("");

  // Client-side validation before hitting the network.
  // This mirrors the backend validation to give instant feedback.
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Guard: require a property selection.
    if (!propertyId) {
      setValidationError("Please select a property.");
      return;
    }

    // Guard: description must not be blank.
    const trimmed = description.trim();
    if (!trimmed) {
      setValidationError("Please enter a description of the issue.");
      return;
    }

    // Guard: enforce max length (backend also checks, but this saves a round-trip).
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      setValidationError(
        `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }

    const id = await submit({ propertyId, description: trimmed });

    if (id !== null) {
      // Success: redirect to my tasks.
      // There is no dedicated "issue report submitted" page — the confirmation
      // is communicated via a URL change and the success state of the form.
      navigate("/operator/tasks");
    }
  }

  return (
    <section className="ro-page-content">
      {/* Page header with back navigation to the operator task list */}
      <PageHeader
        title="Report an Issue"
        subtitle="Describe the problem at the property so the Admin can review it."
        action={
          <Link
            to="/operator/tasks"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Back to My Tasks
          </Link>
        }
      />

      {/* The form is wrapped in ro-form-card to match the design system pattern
          used by all other create/edit forms in the app. */}
      <div className="ro-form-card">
        {/* Show a warning if properties could not be loaded.
            The user can still attempt to type an id manually if they know it,
            but in practice this means they should refresh. */}
        {propertiesError && (
          <div className="alert alert-warning mb-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            {propertiesError}
          </div>
        )}

        {/* API-level error from the submit attempt */}
        {(submitError ?? validationError) && (
          <div className="alert alert-danger mb-3" role="alert">
            <i className="bi bi-x-circle me-2" aria-hidden="true" />
            {submitError ?? validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Property select — populated asynchronously.
              While loading, the select is disabled with a placeholder option. */}
          <div className="mb-3">
            <label htmlFor="propertyId" className="form-label">
              Property <span className="text-danger">*</span>
            </label>
            <select
              id="propertyId"
              className="form-select"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={loadingProperties || submitting}
              required
            >
              <option value="">
                {loadingProperties
                  ? "Loading properties…"
                  : "Select a property"}
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {/* Show both code and name for clarity (e.g. "APT-001 — Milano Loft") */}
                  {p.propertyCode} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description textarea — the free-text field Operator fills in from the field */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              className="form-control"
              rows={5}
              placeholder="Describe the issue in detail (e.g. 'Leaking tap in bathroom, water on floor')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={MAX_DESCRIPTION_LENGTH}
              required
            />
            {/* Character counter — helps the user stay under the 2000-char limit */}
            <div className="form-text text-end">
              {description.length} / {MAX_DESCRIPTION_LENGTH}
            </div>
          </div>

          {/* Submit button — spinner replaces the icon while in flight */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loadingProperties}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Submitting…
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2" aria-hidden="true" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

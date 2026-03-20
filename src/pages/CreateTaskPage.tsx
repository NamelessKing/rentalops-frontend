// CreateTaskPage.tsx
// Admin form for creating a new task in POOL or DIRECT_ASSIGNMENT mode.
//
// Key business rules enforced by this form:
//   - POOL:              assigneeId is hidden and must NOT be sent in the request body
//   - DIRECT_ASSIGNMENT: assigneeId is shown and required before submit
//   - status is never sent — the backend assigns it from dispatchMode

import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateTask } from "@/features/tasks/hooks/useCreateTask";
import type {
  TaskCategory,
  TaskDispatchMode,
  TaskPriority,
} from "@/features/tasks/types";

const CATEGORY_OPTIONS: Array<{ value: TaskCategory; label: string }> = [
  { value: "CLEANING", label: "Cleaning" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "GENERAL_MAINTENANCE", label: "General Maintenance" },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export function CreateTaskPage() {
  const navigate = useNavigate();
  const {
    properties,
    operators,
    loadingData,
    loadDataError,
    submitting,
    submitError,
    submit,
  } = useCreateTask();

  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState<TaskCategory>("CLEANING");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [dispatchMode, setDispatchMode] = useState<TaskDispatchMode>("POOL");
  const [assigneeId, setAssigneeId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  // Client-side field validation errors — separate from API errors.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Operators filtered by the currently selected category AND active status.
  // Recomputed on every render — category and operators are both reactive.
  // We only show operators whose specialization matches the task category so the
  // Admin is guided toward correct assignments. This is a UX guard; the backend
  // should enforce the same rule server-side (open question flagged to backend).
  const eligibleOperators = operators.filter(
    (op) => op.status === "ACTIVE" && op.specializationCategory === category,
  );

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!propertyId) {
      errors.propertyId = "Please select a property.";
    }

    if (!summary.trim()) {
      errors.summary = "Summary is required.";
    } else if (summary.trim().length > 255) {
      errors.summary = "Summary must be at most 255 characters.";
    }

    // assigneeId is required client-side only when DIRECT_ASSIGNMENT.
    // Also block submit when no eligible operators exist for the selected category.
    if (dispatchMode === "DIRECT_ASSIGNMENT" && !assigneeId) {
      errors.assigneeId =
        eligibleOperators.length === 0
          ? "No active operators available for this category. Change category or dispatch mode."
          : "Please select an operator for direct assignment.";
    }

    if (
      estimatedHours !== "" &&
      (isNaN(Number(estimatedHours)) || Number(estimatedHours) <= 0)
    ) {
      errors.estimatedHours = "Estimated hours must be a positive number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    e,
  ) => {
    e.preventDefault();
    if (!validate()) return;

    const created = await submit({
      propertyId,
      category,
      priority,
      summary: summary.trim(),
      description: description.trim() || undefined,
      dispatchMode,
      // Omit assigneeId entirely for POOL — sending it (even as null) causes 400.
      ...(dispatchMode === "DIRECT_ASSIGNMENT" && { assigneeId }),
      estimatedHours:
        estimatedHours !== "" ? Number(estimatedHours) : undefined,
    });

    if (created) {
      // Use the id from the 201 response to navigate directly — no second GET needed.
      navigate(`/admin/tasks/${created.id}`);
    }
  };

  // Block the form while selects are loading to avoid empty dropdowns on submit.
  if (loadingData) {
    return (
      <section aria-live="polite">
        <h1 className="h4 mb-3">New Task</h1>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading form data…
          </div>
        </div>
      </section>
    );
  }

  if (loadDataError) {
    return (
      <section aria-live="assertive">
        <h1 className="h4 mb-3">New Task</h1>
        <div className="alert alert-danger">{loadDataError}</div>
        <Link to="/admin/tasks" className="btn btn-outline-secondary btn-sm">
          Back to Tasks
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/tasks" className="btn btn-outline-secondary btn-sm">
          &larr; Back
        </Link>
        <h1 className="h4 mb-0">New Task</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {submitError && (
            <div className="alert alert-danger" role="alert">
              {submitError}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            {/* Property */}
            <div className="mb-3">
              <label htmlFor="propertyId" className="form-label">
                Property <span className="text-danger">*</span>
              </label>
              <select
                id="propertyId"
                className={`form-select ${fieldErrors.propertyId ? "is-invalid" : ""}`}
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select a property…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
              {fieldErrors.propertyId && (
                <div className="invalid-feedback">{fieldErrors.propertyId}</div>
              )}
            </div>

            {/* Category */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as TaskCategory);
                  // Reset assignee whenever category changes — the previously
                  // selected operator may not belong to the new category.
                  setAssigneeId("");
                  setFieldErrors((prev) => ({
                    ...prev,
                    assigneeId: undefined as unknown as string,
                  }));
                }}
                disabled={submitting}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label htmlFor="priority" className="form-label">
                Priority <span className="text-danger">*</span>
              </label>
              <select
                id="priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={submitting}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div className="mb-3">
              <label htmlFor="summary" className="form-label">
                Summary <span className="text-danger">*</span>
              </label>
              <input
                id="summary"
                type="text"
                className={`form-control ${fieldErrors.summary ? "is-invalid" : ""}`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={255}
                disabled={submitting}
              />
              {fieldErrors.summary && (
                <div className="invalid-feedback">{fieldErrors.summary}</div>
              )}
            </div>

            {/* Description — optional */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={submitting}
              />
            </div>

            {/* Estimated hours — optional */}
            <div className="mb-3">
              <label htmlFor="estimatedHours" className="form-label">
                Estimated hours
              </label>
              <input
                id="estimatedHours"
                type="number"
                className={`form-control ${fieldErrors.estimatedHours ? "is-invalid" : ""}`}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                min="0"
                step="0.5"
                disabled={submitting}
              />
              {fieldErrors.estimatedHours && (
                <div className="invalid-feedback">
                  {fieldErrors.estimatedHours}
                </div>
              )}
            </div>

            {/* Dispatch mode — radio */}
            <div className="mb-3">
              <span className="form-label d-block">
                Dispatch mode <span className="text-danger">*</span>
              </span>
              <div className="form-check form-check-inline">
                <input
                  id="modePool"
                  type="radio"
                  className="form-check-input"
                  name="dispatchMode"
                  value="POOL"
                  checked={dispatchMode === "POOL"}
                  onChange={() => {
                    setDispatchMode("POOL");
                    // Clear the selected operator when switching back to pool.
                    setAssigneeId("");
                  }}
                  disabled={submitting}
                />
                <label htmlFor="modePool" className="form-check-label">
                  Pool{" "}
                  <small className="text-muted">
                    (visible to matching operators)
                  </small>
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  id="modeDirect"
                  type="radio"
                  className="form-check-input"
                  name="dispatchMode"
                  value="DIRECT_ASSIGNMENT"
                  checked={dispatchMode === "DIRECT_ASSIGNMENT"}
                  onChange={() => setDispatchMode("DIRECT_ASSIGNMENT")}
                  disabled={submitting}
                />
                <label htmlFor="modeDirect" className="form-check-label">
                  Direct assignment
                </label>
              </div>
            </div>

            {/* Assignee select — shown only for DIRECT_ASSIGNMENT */}
            {dispatchMode === "DIRECT_ASSIGNMENT" && (
              <div className="mb-3">
                <label htmlFor="assigneeId" className="form-label">
                  Operator <span className="text-danger">*</span>
                </label>
                <select
                  id="assigneeId"
                  className={`form-select ${fieldErrors.assigneeId ? "is-invalid" : ""}`}
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  // Disabled when no eligible operators exist — selecting would be pointless.
                  disabled={submitting || eligibleOperators.length === 0}
                >
                  {eligibleOperators.length === 0 ? (
                    <option value="">
                      No active operators for this category
                    </option>
                  ) : (
                    <>
                      <option value="">Select an operator…</option>
                      {eligibleOperators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.fullName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {/* Warning shown inline when no operators match the category. */}
                {eligibleOperators.length === 0 &&
                  dispatchMode === "DIRECT_ASSIGNMENT" && (
                    <div className="form-text text-warning">
                      No active operators with specialization{" "}
                      <strong>{category}</strong>. Consider switching to Pool
                      mode or creating an operator with this category.
                    </div>
                  )}
                {fieldErrors.assigneeId && (
                  <div className="invalid-feedback">
                    {fieldErrors.assigneeId}
                  </div>
                )}
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Task"}
              </button>
              <Link to="/admin/tasks" className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

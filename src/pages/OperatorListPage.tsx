// OperatorListPage.tsx
// Admin page for viewing the tenant operator roster.
//
// Why this page exists:
// It gives Admin users a concrete team overview and acts as the entry point
// for creating operators during Slice 2 setup.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useOperatorList } from "@/features/operators/hooks/useOperatorList";
import { useOperatorsWorkloadMap } from "@/features/tasks/hooks/useOperatorsWorkloadMap";
import {
  disableOperator,
  enableOperator,
} from "@/features/operators/api/operatorsApi";
import type { OperatorListItem } from "@/features/operators/types";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { EmptyState } from "@/shared/components/EmptyState";

interface OperatorListLocationState {
  successMessage?: string;
}

// Canonical specialization buckets used in team coverage checks.
// Keeping this local avoids extra hooks or API calls for a lightweight summary strip.
const SPECIALIZATION_CATEGORIES = [
  "CLEANING",
  "PLUMBING",
  "ELECTRICAL",
  "GENERAL_MAINTENANCE",
] as const;

export function OperatorListPage() {
  const location = useLocation();
  const successMessage = (location.state as OperatorListLocationState | null)
    ?.successMessage;
  const { data, loading, error, reload } = useOperatorList();
  const {
    workloadByOperatorId,
    loading: workloadLoading,
    error: workloadError,
  } = useOperatorsWorkloadMap();

  // Tracks which row's toggle button is in flight to prevent double-clicks.
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // Holds any error message from an inline disable/enable action.
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Handles toggling a single operator's status between ACTIVE and DISABLED.
  // Reloads the full list after success so the UI reflects the new state.
  async function handleToggle(operator: OperatorListItem) {
    setTogglingId(operator.id);
    setToggleError(null);
    try {
      if (operator.status === "ACTIVE") {
        await disableOperator(operator.id);
      } else {
        await enableOperator(operator.id);
      }
      await reload();
    } catch {
      setToggleError("Failed to update operator status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  // Shared CTA used in the PageHeader across all render branches
  const addOperatorCTA = (
    <Link to="/admin/operators/new" className="btn btn-primary">
      <i className="bi bi-person-plus me-2" aria-hidden="true" />
      Add Operator
    </Link>
  );

  if (loading) {
    // Skeleton mirrors the real layout (mobile cards + desktop table) so the page
    // doesn't visually jump when data arrives. Both breakpoints are covered separately,
    // matching the structure of the success state below.
    return (
      <section aria-live="polite">
        <PageHeader title="Team" action={addOperatorCTA} />

        {/* ── Mobile skeleton — visible on xs/sm ── */}
        <div className="d-block d-md-none">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="ro-task-card">
              <div className="card-body">
                {/* Row 1: name placeholder + badge placeholder */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="placeholder-glow" style={{ width: "55%" }}>
                    <span className="placeholder col-12" />
                  </span>
                  <span className="placeholder-glow" style={{ width: "22%" }}>
                    <span className="placeholder col-12 rounded-pill" />
                  </span>
                </div>
                {/* Row 2: email placeholder */}
                <div className="placeholder-glow mb-2">
                  <span className="placeholder col-8" />
                </div>
                {/* Row 3: category badge placeholder */}
                <div className="placeholder-glow mb-3">
                  <span className="placeholder col-4" />
                </div>
                {/* Row 4: action buttons placeholder — d-grid matches the real layout */}
                <div className="d-grid gap-2 placeholder-glow">
                  <span className="placeholder btn col-12" />
                  <span className="placeholder btn col-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop skeleton — visible on md and above ── */}
        <div className="d-none d-md-block">
          <div className="ro-section-panel">
            <div className="table-responsive">
              {/* Real thead so column widths match the loaded table */}
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Varying placeholder widths so the skeleton looks natural */}
                  {[
                    ["col-7", "col-9", "col-6", "col-5", "col-6"],
                    ["col-5", "col-8", "col-7", "col-4", "col-5"],
                    ["col-8", "col-7", "col-5", "col-5", "col-6"],
                    ["col-6", "col-9", "col-6", "col-4", "col-5"],
                  ].map((cols, rowIdx) => (
                    <tr key={rowIdx}>
                      {cols.map((w, colIdx) => (
                        <td key={colIdx}>
                          <span className="placeholder-glow d-block">
                            <span className={`placeholder ${w}`} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <PageHeader title="Team" action={addOperatorCTA} />
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => void reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const operators = data ?? [];

  if (operators.length === 0) {
    return (
      <section>
        <PageHeader title="Team" action={addOperatorCTA} />
        <EmptyState
          icon="bi-people"
          title="No operators yet"
          message="Create your first operator to start building your tenant team."
          action={
            <Link to="/admin/operators/new" className="btn btn-primary">
              Create first operator
            </Link>
          }
        />
      </section>
    );
  }

  // Team summary is derived from the already-loaded list data.
  // This keeps the strip informative without introducing extra fetches.
  const totalOperators = operators.length;
  const activeOperators = operators.filter((o) => o.status === "ACTIVE").length;
  const disabledOperators = totalOperators - activeOperators;

  const activeSpecializations = new Set(
    operators
      .filter((o) => o.status === "ACTIVE")
      .map((o) => o.specializationCategory),
  );
  const specializationCoverage = `${activeSpecializations.size}/${SPECIALIZATION_CATEGORIES.length}`;

  // Missing means: no ACTIVE operator exists for that specialization.
  // This includes categories that are absent entirely and categories with only DISABLED operators.
  const missingActiveSpecializations = SPECIALIZATION_CATEGORIES.filter(
    (category) => !activeSpecializations.has(category),
  );

  return (
    <section>
      <PageHeader title="Team" action={addOperatorCTA} />

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {/* Inline error from a disable/enable action */}
      {toggleError && (
        <div className="alert alert-warning alert-dismissible" role="alert">
          {toggleError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setToggleError(null)}
            aria-label="Close"
          />
        </div>
      )}

      {/* Compact team summary strip — secondary context above the main list. */}
      <div className="ro-section-panel mb-3" aria-label="Team summary">
        <div className="p-3">
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-light border">
              Total {totalOperators}
            </span>
            <span className="badge text-bg-light border">
              Active {activeOperators}
            </span>
            <span className="badge text-bg-light border">
              Disabled {disabledOperators}
            </span>
            <span className="badge text-bg-light border">
              Coverage {specializationCoverage}
            </span>
          </div>

          {missingActiveSpecializations.length > 0 && (
            <p className="small text-muted mb-0 mt-2">
              No active: {missingActiveSpecializations.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Workload status is secondary: keep this compact and never block list usage. */}
      {workloadLoading && (
        <p className="small text-muted mb-2">Loading workload badges...</p>
      )}
      {workloadError && !workloadLoading && (
        <p className="small text-muted mb-2">{workloadError}</p>
      )}

      {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
           Each operator gets its own card with stacked full-width buttons.
           This avoids horizontal scrolling on small screens. */}
      <div className="d-block d-md-none">
        {operators.map((operator) => (
          <div key={operator.id} className="ro-task-card">
            <div className="card-body">
              {(() => {
                const workload = workloadByOperatorId[operator.id];
                const hasAssigned = (workload?.assigned ?? 0) > 0;
                const hasInProgress = (workload?.inProgress ?? 0) > 0;
                const hasCompleted = (workload?.completed ?? 0) > 0;
                const hasWorkload =
                  hasAssigned || hasInProgress || hasCompleted;

                return (
                  <>
                    {/* Row 1: name + status badge */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        className="fw-semibold"
                        style={{ color: "var(--ro-text)" }}
                      >
                        {operator.fullName}
                      </span>
                      <StatusBadge status={operator.status} type="operator" />
                    </div>
                    {/* Row 2: email */}
                    <div
                      className="mb-1"
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--ro-text-muted)",
                      }}
                    >
                      {operator.email}
                    </div>
                    {/* Row 3: specialization badge */}
                    <div className="mb-3">
                      <span className="badge text-bg-light border">
                        {operator.specializationCategory}
                      </span>
                    </div>
                    {/* Row 3.5: compact workload signals, only when at least one value is non-zero. */}
                    {!workloadLoading && !workloadError && hasWorkload && (
                      <div
                        className="d-flex flex-wrap gap-1 mb-3"
                        aria-label="Workload summary"
                      >
                        {hasAssigned && (
                          <span
                            className="badge text-bg-light border"
                            style={{ fontSize: "0.7rem" }}
                            title="Assigned tasks"
                          >
                            A {workload?.assigned ?? 0}
                          </span>
                        )}
                        {hasInProgress && (
                          <span
                            className="badge text-bg-light border"
                            style={{ fontSize: "0.7rem" }}
                            title="In progress tasks"
                          >
                            IP {workload?.inProgress ?? 0}
                          </span>
                        )}
                        {hasCompleted && (
                          <span
                            className="badge text-bg-light border"
                            style={{ fontSize: "0.7rem" }}
                            title="Completed tasks"
                          >
                            C {workload?.completed ?? 0}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Row 4: action CTAs stacked full-width */}
                    <div className="d-grid gap-2">
                      <Link
                        to={`/admin/operators/${operator.id}/edit`}
                        state={{ operator }}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          operator.status === "ACTIVE"
                            ? "btn-outline-danger"
                            : "btn-outline-success"
                        }`}
                        onClick={() => void handleToggle(operator)}
                        disabled={togglingId === operator.id}
                      >
                        {togglingId === operator.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            />
                            Updating...
                          </>
                        ) : operator.status === "ACTIVE" ? (
                          "Disable"
                        ) : (
                          "Enable"
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table — visible on md and above ── */}
      <div className="d-none d-md-block">
        <div className="ro-section-panel">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => (
                  <tr key={operator.id}>
                    <td className="fw-medium">{operator.fullName}</td>
                    <td style={{ color: "var(--ro-text-muted)" }}>
                      {operator.email}
                    </td>
                    <td>
                      <div>{operator.specializationCategory}</div>
                      {!workloadLoading &&
                        !workloadError &&
                        (() => {
                          const workload = workloadByOperatorId[operator.id];
                          const hasAssigned = (workload?.assigned ?? 0) > 0;
                          const hasInProgress = (workload?.inProgress ?? 0) > 0;
                          const hasCompleted = (workload?.completed ?? 0) > 0;
                          const hasWorkload =
                            hasAssigned || hasInProgress || hasCompleted;

                          if (!hasWorkload) return null;

                          return (
                            <div
                              className="d-flex flex-wrap gap-1 mt-1"
                              aria-label="Workload summary"
                            >
                              {hasAssigned && (
                                <span
                                  className="badge text-bg-light border"
                                  style={{ fontSize: "0.7rem" }}
                                  title="Assigned tasks"
                                >
                                  A {workload?.assigned ?? 0}
                                </span>
                              )}
                              {hasInProgress && (
                                <span
                                  className="badge text-bg-light border"
                                  style={{ fontSize: "0.7rem" }}
                                  title="In progress tasks"
                                >
                                  IP {workload?.inProgress ?? 0}
                                </span>
                              )}
                              {hasCompleted && (
                                <span
                                  className="badge text-bg-light border"
                                  style={{ fontSize: "0.7rem" }}
                                  title="Completed tasks"
                                >
                                  C {workload?.completed ?? 0}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                    </td>
                    <td>
                      <StatusBadge status={operator.status} type="operator" />
                    </td>
                    {/* Actions: Edit always visible; Disable/Enable toggled by status */}
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Pass operator via location state to skip an extra API call */}
                        <Link
                          to={`/admin/operators/${operator.id}/edit`}
                          state={{ operator }}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            operator.status === "ACTIVE"
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() => void handleToggle(operator)}
                          disabled={togglingId === operator.id}
                        >
                          {togglingId === operator.id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : operator.status === "ACTIVE" ? (
                            "Disable"
                          ) : (
                            "Enable"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

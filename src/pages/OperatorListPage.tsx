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

export function OperatorListPage() {
  const location = useLocation();
  const successMessage = (location.state as OperatorListLocationState | null)
    ?.successMessage;
  const { data, loading, error, reload } = useOperatorList();

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
    return (
      <section aria-live="polite">
        <PageHeader title="Team" action={addOperatorCTA} />
        <div className="ro-section-panel">
          <div
            className="p-4 text-center"
            style={{ color: "var(--ro-text-muted)" }}
          >
            Loading operators...
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

      {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
           Each operator gets its own card with stacked full-width buttons.
           This avoids horizontal scrolling on small screens. */}
      <div className="d-block d-md-none">
        {operators.map((operator) => (
          <div key={operator.id} className="ro-task-card">
            <div className="card-body">
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
                style={{ fontSize: "0.875rem", color: "var(--ro-text-muted)" }}
              >
                {operator.email}
              </div>
              {/* Row 3: specialization badge */}
              <div className="mb-3">
                <span className="badge text-bg-light border">
                  {operator.specializationCategory}
                </span>
              </div>
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
                    <td>{operator.specializationCategory}</td>
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

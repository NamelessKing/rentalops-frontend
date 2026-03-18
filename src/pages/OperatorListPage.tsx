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

  if (loading) {
    return (
      <section aria-live="polite">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Team</h1>
          <Link
            to="/admin/operators/new"
            className="btn btn-primary"
            aria-disabled
          >
            Add Operator
          </Link>
        </div>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading operators...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Team</h1>
          <Link to="/admin/operators/new" className="btn btn-primary">
            Add Operator
          </Link>
        </div>

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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Team</h1>
          <Link to="/admin/operators/new" className="btn btn-primary">
            Add Operator
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body py-5 text-center">
            <h2 className="h6 mb-2">No operators yet</h2>
            <p className="text-muted mb-4">
              Create your first operator to start building your tenant team.
            </p>
            <Link to="/admin/operators/new" className="btn btn-primary">
              Create first operator
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Team</h1>
        <Link to="/admin/operators/new" className="btn btn-primary">
          Add Operator
        </Link>
      </div>

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
          <div key={operator.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              {/* Row 1: name + status badge */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-semibold">{operator.fullName}</span>
                <span
                  className={`badge ${
                    operator.status === "ACTIVE"
                      ? "text-bg-success"
                      : "text-bg-secondary"
                  }`}
                >
                  {operator.status}
                </span>
              </div>
              {/* Row 2: email */}
              <div className="text-muted small mb-1">{operator.email}</div>
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
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
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
                    <td>{operator.fullName}</td>
                    <td>{operator.email}</td>
                    <td>{operator.specializationCategory}</td>
                    <td>
                      <span
                        className={`badge ${
                          operator.status === "ACTIVE"
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {operator.status}
                      </span>
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

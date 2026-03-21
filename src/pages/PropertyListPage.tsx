// PropertyListPage.tsx
// Admin page for viewing tenant properties.
//
// Why this page exists:
// Slice 2 requires Admin users to build and browse the property catalog
// before task and issue-report workflows can use it.

import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { usePropertyList } from "@/features/properties/hooks/usePropertyList";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { EmptyState } from "@/shared/components/EmptyState";

interface PropertyListLocationState {
  successMessage?: string;
}

export function PropertyListPage() {
  const location = useLocation();
  const successMessage = (location.state as PropertyListLocationState | null)
    ?.successMessage;
  const { data, loading, error, reload } = usePropertyList();

  const addPropertyCTA = (
    <Link to="/admin/properties/new" className="btn btn-primary">
      <i className="bi bi-plus-lg me-2" aria-hidden="true" />
      Add Property
    </Link>
  );

  if (loading) {
    return (
      <section aria-live="polite">
        <PageHeader title="Properties" action={addPropertyCTA} />
        <div className="ro-section-panel">
          <div
            className="p-4 text-center"
            style={{ color: "var(--ro-text-muted)" }}
          >
            Loading properties...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <PageHeader title="Properties" action={addPropertyCTA} />
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

  const properties = data ?? [];

  if (properties.length === 0) {
    return (
      <section>
        <PageHeader title="Properties" action={addPropertyCTA} />
        <EmptyState
          icon="bi-house"
          title="No properties yet"
          message="Create your first property to start your operational setup."
          action={
            <Link to="/admin/properties/new" className="btn btn-primary">
              Create first property
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <PageHeader title="Properties" action={addPropertyCTA} />

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
           Cards replace the horizontal table to avoid scroll on small screens. */}
      <div className="d-block d-md-none">
        {properties.map((property) => (
          <div key={property.id} className="ro-task-card">
            <div className="card-body">
              {/* Row 1: property name + status badge */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  className="fw-semibold"
                  style={{ color: "var(--ro-text)" }}
                >
                  {property.name}
                </span>
                <StatusBadge
                  status={property.active ? "ACTIVE" : "INACTIVE"}
                  type="property"
                />
              </div>
              {/* Row 2: property code + city */}
              <div
                className="mb-3"
                style={{ fontSize: "0.875rem", color: "var(--ro-text-muted)" }}
              >
                <span className="badge text-bg-light border me-2">
                  {property.propertyCode}
                </span>
                {property.city}
              </div>
              {/* CTA — full width for easy tap */}
              <Link
                to={`/admin/properties/${property.id}`}
                className="btn btn-outline-primary btn-sm w-100"
              >
                Open Detail
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table — visible on md and above ── */}
      <div className="d-none d-md-block">
        <div className="ro-section-panel">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Name</th>
                  <th scope="col">City</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td
                      style={{
                        color: "var(--ro-text-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {property.propertyCode}
                    </td>
                    <td className="fw-medium">{property.name}</td>
                    <td style={{ color: "var(--ro-text-muted)" }}>
                      {property.city}
                    </td>
                    <td>
                      <StatusBadge
                        status={property.active ? "ACTIVE" : "INACTIVE"}
                        type="property"
                      />
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/admin/properties/${property.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Open Detail
                      </Link>
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

// PropertyListPage.tsx
// Admin page for viewing tenant properties.
//
// Why this page exists:
// Slice 2 requires Admin users to build and browse the property catalog
// before task and issue-report workflows can use it.

import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { usePropertyList } from "@/features/properties/hooks/usePropertyList";

interface PropertyListLocationState {
  successMessage?: string;
}

export function PropertyListPage() {
  const location = useLocation();
  const successMessage = (location.state as PropertyListLocationState | null)
    ?.successMessage;
  const { data, loading, error, reload } = usePropertyList();

  if (loading) {
    return (
      <section aria-live="polite">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Properties</h1>
          <Link
            to="/admin/properties/new"
            className="btn btn-primary"
            aria-disabled
          >
            Add Property
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading properties...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Properties</h1>
          <Link to="/admin/properties/new" className="btn btn-primary">
            Add Property
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

  const properties = data ?? [];

  if (properties.length === 0) {
    return (
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Properties</h1>
          <Link to="/admin/properties/new" className="btn btn-primary">
            Add Property
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body py-5 text-center">
            <h2 className="h6 mb-2">No properties yet</h2>
            <p className="text-muted mb-4">
              Create your first property to start your operational setup.
            </p>
            <Link to="/admin/properties/new" className="btn btn-primary">
              Create first property
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Properties</h1>
        <Link to="/admin/properties/new" className="btn btn-primary">
          Add Property
        </Link>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {/* ── Mobile card list — visible on xs/sm (below md breakpoint) ──
           Cards replace the horizontal table to avoid scroll on small screens. */}
      <div className="d-block d-md-none">
        {properties.map((property) => (
          <div key={property.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              {/* Row 1: property name + status badge */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-semibold">{property.name}</span>
                <span
                  className={`badge ${
                    property.active ? "text-bg-success" : "text-bg-secondary"
                  }`}
                >
                  {property.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              {/* Row 2: property code + city */}
              <div className="text-muted small mb-3">
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
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
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
                    <td>{property.propertyCode}</td>
                    <td>{property.name}</td>
                    <td>{property.city}</td>
                    <td>
                      <span
                        className={`badge ${
                          property.active
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {property.active ? "ACTIVE" : "INACTIVE"}
                      </span>
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

// PropertyDetailPage.tsx
// Admin detail and edit screen for a single property.
//
// Why this page exists:
// Slice 2 requires Admin users to view and update property master data
// before operational task workflows rely on it.

import { useState, type ComponentProps } from "react";
import { Link, useParams } from "react-router-dom";
import { usePropertyDetail } from "@/features/properties/hooks/usePropertyDetail";

interface PropertyFormDraft {
  propertyCode: string;
  name: string;
  address: string;
  city: string;
  notes: string;
}

// Renders property detail in read/edit mode with save feedback.
export function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data, loading, error, reload, saving, saveError, saveSuccess, save } =
    usePropertyDetail(propertyId);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<PropertyFormDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    propertyCode?: string;
    name?: string;
    address?: string;
    city?: string;
  }>({});

  function startEdit() {
    if (!data) {
      return;
    }

    setDraft({
      propertyCode: data.propertyCode,
      name: data.name,
      address: data.address,
      city: data.city,
      notes: data.notes ?? "",
    });
    setFieldErrors({});
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setFieldErrors({});
    setIsEditing(false);
  }

  function validate(values: PropertyFormDraft) {
    const nextErrors: {
      propertyCode?: string;
      name?: string;
      address?: string;
      city?: string;
    } = {};

    if (!values.propertyCode.trim()) {
      nextErrors.propertyCode = "Property code is required.";
    }

    if (!values.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!values.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!values.city.trim()) {
      nextErrors.city = "City is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSave: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    e,
  ) => {
    e.preventDefault();

    if (!draft) {
      return;
    }

    if (!validate(draft)) {
      return;
    }

    const updated = await save({
      propertyCode: draft.propertyCode.trim(),
      name: draft.name.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      notes: draft.notes.trim() || undefined,
    });

    if (!updated) {
      return;
    }

    cancelEdit();
  };

  if (loading) {
    return (
      <section aria-live="polite">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Property Detail</h1>
          <Link to="/admin/properties" className="btn btn-outline-secondary">
            Back to Properties
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading property details...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Property Detail</h1>
          <Link to="/admin/properties" className="btn btn-outline-secondary">
            Back to Properties
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

  if (!data) {
    return (
      <section>
        <div className="alert alert-warning">No property data available.</div>
      </section>
    );
  }

  const values: PropertyFormDraft =
    isEditing && draft
      ? draft
      : {
          propertyCode: data.propertyCode,
          name: data.name,
          address: data.address,
          city: data.city,
          notes: data.notes ?? "",
        };

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Property Detail</h1>
        <div className="d-flex gap-2">
          <Link to="/admin/properties" className="btn btn-outline-secondary">
            Back to Properties
          </Link>
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startEdit}
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {saveSuccess && <div className="alert alert-success">{saveSuccess}</div>}
      {saveError && <div className="alert alert-danger">{saveError}</div>}

      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="small text-muted">Current Status</div>
            <span
              className={`badge ${
                data.active ? "text-bg-success" : "text-bg-secondary"
              }`}
            >
              {data.active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <div className="small text-muted">
            Property ID: <code>{data.id}</code>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSave} noValidate>
            <div className="mb-3">
              <label htmlFor="propertyCode" className="form-label">
                Property code
              </label>
              <input
                id="propertyCode"
                className={`form-control ${fieldErrors.propertyCode ? "is-invalid" : ""}`}
                value={values.propertyCode}
                onChange={(e) => {
                  setDraft((prev) =>
                    prev
                      ? { ...prev, propertyCode: e.target.value }
                      : {
                          propertyCode: e.target.value,
                          name: data.name,
                          address: data.address,
                          city: data.city,
                          notes: data.notes ?? "",
                        },
                  );
                  if (fieldErrors.propertyCode) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      propertyCode: undefined,
                    }));
                  }
                }}
                disabled={!isEditing || saving}
                required
              />
              {fieldErrors.propertyCode && (
                <div className="invalid-feedback">
                  {fieldErrors.propertyCode}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                value={values.name}
                onChange={(e) => {
                  setDraft((prev) =>
                    prev
                      ? { ...prev, name: e.target.value }
                      : {
                          propertyCode: data.propertyCode,
                          name: e.target.value,
                          address: data.address,
                          city: data.city,
                          notes: data.notes ?? "",
                        },
                  );
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                disabled={!isEditing || saving}
                required
              />
              {fieldErrors.name && (
                <div className="invalid-feedback">{fieldErrors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                id="address"
                className={`form-control ${fieldErrors.address ? "is-invalid" : ""}`}
                value={values.address}
                onChange={(e) => {
                  setDraft((prev) =>
                    prev
                      ? { ...prev, address: e.target.value }
                      : {
                          propertyCode: data.propertyCode,
                          name: data.name,
                          address: e.target.value,
                          city: data.city,
                          notes: data.notes ?? "",
                        },
                  );
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
                disabled={!isEditing || saving}
                required
              />
              {fieldErrors.address && (
                <div className="invalid-feedback">{fieldErrors.address}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                id="city"
                className={`form-control ${fieldErrors.city ? "is-invalid" : ""}`}
                value={values.city}
                onChange={(e) => {
                  setDraft((prev) =>
                    prev
                      ? { ...prev, city: e.target.value }
                      : {
                          propertyCode: data.propertyCode,
                          name: data.name,
                          address: data.address,
                          city: e.target.value,
                          notes: data.notes ?? "",
                        },
                  );
                  if (fieldErrors.city) {
                    setFieldErrors((prev) => ({ ...prev, city: undefined }));
                  }
                }}
                disabled={!isEditing || saving}
                required
              />
              {fieldErrors.city && (
                <div className="invalid-feedback">{fieldErrors.city}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="form-label">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                className="form-control"
                value={values.notes}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev
                      ? { ...prev, notes: e.target.value }
                      : {
                          propertyCode: data.propertyCode,
                          name: data.name,
                          address: data.address,
                          city: data.city,
                          notes: e.target.value,
                        },
                  )
                }
                rows={3}
                disabled={!isEditing || saving}
              />
            </div>

            {isEditing && (
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

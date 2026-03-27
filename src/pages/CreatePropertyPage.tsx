// CreatePropertyPage.tsx
// Admin form page for creating a new property in the current tenant.
//
// Why this page exists:
// Slice 2 requires a property catalog before tasks and issue reports can be
// managed on real operational entities.

import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateProperty } from "@/features/properties/hooks/useCreateProperty";
import { PageHeader } from "@/shared/components/PageHeader";

// Renders the create-property form and handles validation + submit feedback.
export function CreatePropertyPage() {
  const navigate = useNavigate();
  const { submitting, error, submit } = useCreateProperty();

  const [propertyCode, setPropertyCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    propertyCode?: string;
    name?: string;
    address?: string;
    city?: string;
  }>({});

  function validate() {
    const nextErrors: {
      propertyCode?: string;
      name?: string;
      address?: string;
      city?: string;
    } = {};

    if (!propertyCode.trim()) {
      nextErrors.propertyCode = "Property code is required.";
    }

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!city.trim()) {
      nextErrors.city = "City is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    e,
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const created = await submit({
      propertyCode: propertyCode.trim(),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      notes: notes.trim() || undefined,
    });

    if (!created) {
      return;
    }

    navigate("/admin/properties", {
      replace: true,
      state: {
        successMessage: `${created.propertyCode} created successfully.`,
      },
    });
  };

  return (
    <section>
      {/* Consistent page header: title, subtitle, back button. */}
      <PageHeader
        title="Create Property"
        subtitle="Add a property to make it available for future task and issue flows."
        action={
          <Link
            to="/admin/properties"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Back to Properties
          </Link>
        }
      />

      <div className="ro-form-card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="propertyCode" className="form-label">
              Property code
            </label>
            <input
              id="propertyCode"
              className={`form-control ${fieldErrors.propertyCode ? "is-invalid" : ""}`}
              value={propertyCode}
              onChange={(e) => {
                setPropertyCode(e.target.value);
                if (fieldErrors.propertyCode) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    propertyCode: undefined,
                  }));
                }
              }}
              placeholder="APT-001"
              disabled={submitting}
              required
            />
            {fieldErrors.propertyCode && (
              <div className="invalid-feedback">{fieldErrors.propertyCode}</div>
            )}
            <div className="form-text">
              Backend normalizes this value to uppercase on save.
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Milano Centrale Loft"
              disabled={submitting}
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
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (fieldErrors.address) {
                  setFieldErrors((prev) => ({ ...prev, address: undefined }));
                }
              }}
              placeholder="Via Roma 1"
              disabled={submitting}
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
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (fieldErrors.city) {
                  setFieldErrors((prev) => ({ ...prev, city: undefined }));
                }
              }}
              placeholder="Milano"
              disabled={submitting}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Check-in instructions or operational notes"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creating…
              </>
            ) : (
              "Create Property"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

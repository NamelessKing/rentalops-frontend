// AppHomePage.tsx
// The public entry point of the application, rendered at "/".
//
// Composed of four sections:
//   1. Hero         — brand name, value statement, primary CTAs.
//   2. Overview     — a three-column summary of what the app does.
//   3. Workflow     — three numbered steps explaining the operational loop.
//   4. Quick Access — compact cards linking directly into each app module.
//
// No auth state or backend data is needed here — all sections are static.
// Mobile-first: sections stack vertically; grids go side-by-side on md+.

import { Link } from "react-router-dom";

export function AppHomePage() {
  return (
    <>
      {/* ── Hero ── */}
      {/* White-warm surface gives the hero a subtle lift from the page background
          without introducing a hard contrast break. */}
      <section
        className="py-5 py-md-5"
        style={{ backgroundColor: "var(--ro-surface)" }}
      >
        <div className="container">
          {/* Max-width constraint keeps long headlines readable on wide screens */}
          <div className="row justify-content-center text-center">
            <div className="col-12 col-md-8 col-lg-7">
              <h1
                className="display-6 fw-bold mb-3"
                style={{ color: "var(--ro-text)" }}
              >
                Manage properties, coordinate teams, track work.
              </h1>

              <p
                className="fs-5 mb-4"
                style={{ color: "var(--ro-text-muted)" }}
              >
                RentalOps gives property admins a single place to assign tasks,
                monitor operators, and review issue reports — from any device.
              </p>

              {/* d-grid on mobile → full-width stacked buttons.
                  d-sm-flex on sm+ → inline side-by-side buttons. */}
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <Link to="/login" className="btn btn-primary btn-lg px-4">
                  Open the app
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-secondary btn-lg px-4"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Overview ── */}
      {/* Parchment background (--ro-bg) visually separates this section from
          the hero without needing a border. */}
      <section className="py-5" style={{ backgroundColor: "var(--ro-bg)" }}>
        <div className="container">
          <div className="row g-4">
            {/* Each card uses the standard surface + border tokens for consistency
                with every other card in the app. */}
            <div className="col-12 col-md-4">
              <div
                className="p-4 h-100 rounded"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-2"
                  style={{ color: "var(--ro-primary)" }}
                >
                  Properties
                </h6>
                <p
                  className="mb-0 small"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Organise your units into a clear property catalog. Each
                  property becomes the context for all tasks and reports.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="p-4 h-100 rounded"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-2"
                  style={{ color: "var(--ro-primary)" }}
                >
                  Operators
                </h6>
                <p
                  className="mb-0 small"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Add field operators to your team. Assign tasks directly or let
                  operators pick from the shared pool.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="p-4 h-100 rounded"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-2"
                  style={{ color: "var(--ro-primary)" }}
                >
                  Tasks &amp; Issue Reports
                </h6>
                <p
                  className="mb-0 small"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Track every job from open to complete. Operators flag
                  problems; admins review and convert them into tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      {/* Shows the three-step operational loop so new users understand how the
          pieces fit together. Surface background alternates against the
          parchment of the Overview section to create a clear visual break. */}
      <section
        className="py-5"
        style={{ backgroundColor: "var(--ro-surface)" }}
      >
        <div className="container">
          {/* Section label — small and understated, not a marketing headline */}
          <p
            className="text-uppercase fw-semibold mb-4"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "var(--ro-text-muted)",
            }}
          >
            How it works
          </p>

          <div className="row g-4">
            {/* Each step is self-contained: a large typographic number anchors
                the block visually without requiring any circles or custom shapes. */}
            <div className="col-12 col-md-4">
              {/* Large number uses primary color at low opacity so it reads as
                  a visual marker rather than a heading competing for attention. */}
              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "2.5rem",
                  lineHeight: 1,
                  color: "var(--ro-primary)",
                  opacity: 0.25,
                }}
                aria-hidden="true"
              >
                1
              </div>
              <h6
                className="fw-semibold mb-1"
                style={{ color: "var(--ro-text)" }}
              >
                Properties
              </h6>
              <p
                className="mb-0 small"
                style={{ color: "var(--ro-text-muted)" }}
              >
                Define your operational context. Every task and issue report is
                tied to a property, keeping work organised and traceable.
              </p>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "2.5rem",
                  lineHeight: 1,
                  color: "var(--ro-primary)",
                  opacity: 0.25,
                }}
                aria-hidden="true"
              >
                2
              </div>
              <h6
                className="fw-semibold mb-1"
                style={{ color: "var(--ro-text)" }}
              >
                Operators
              </h6>
              <p
                className="mb-0 small"
                style={{ color: "var(--ro-text-muted)" }}
              >
                Field operators pick up tasks from the pool or receive direct
                assignments. When they spot a problem, they file an issue
                report.
              </p>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "2.5rem",
                  lineHeight: 1,
                  color: "var(--ro-primary)",
                  opacity: 0.25,
                }}
                aria-hidden="true"
              >
                3
              </div>
              <h6
                className="fw-semibold mb-1"
                style={{ color: "var(--ro-text)" }}
              >
                Admins
              </h6>
              <p
                className="mb-0 small"
                style={{ color: "var(--ro-text-muted)" }}
              >
                Review open issue reports, convert them into tasks, assign work,
                and track progress — all from a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Access ── */}
      {/* Links directly into each app module so returning users can navigate
          without scrolling back to the hero CTAs. Cards are intentionally
          compact — they act as navigation shortcuts, not descriptive blocks.
          All cards point to /admin/* routes. Two cases are handled by the
          route guards automatically — no extra logic is needed here:
            • Unauthenticated user  → RequireAuth redirects to /login.
            • Authenticated Operator → RequireRole redirects to /operator/tasks. */}
      <section className="py-5" style={{ backgroundColor: "var(--ro-bg)" }}>
        <div className="container">
          <p
            className="text-uppercase fw-semibold mb-4"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "var(--ro-text-muted)",
            }}
          >
            Quick Access
          </p>

          {/* col-12 on mobile (full-width stack), col-sm-6 on small screens (2 columns),
              col-md-4 on medium+ (3 columns). Five cards → 3 + 2 rows on desktop. */}
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-4">
              <div
                className="p-3 h-100 rounded d-flex flex-column"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-1"
                  style={{ color: "var(--ro-text)" }}
                >
                  Dashboard
                </h6>
                <p
                  className="mb-3 small flex-grow-1"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  See open tasks, active operators, and recent issue reports at
                  a glance.
                </p>
                {/* w-100 makes the button touch both card edges on mobile for easy tapping */}
                <Link
                  to="/admin/dashboard"
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div
                className="p-3 h-100 rounded d-flex flex-column"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-1"
                  style={{ color: "var(--ro-text)" }}
                >
                  Properties
                </h6>
                <p
                  className="mb-3 small flex-grow-1"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Add and organise your rental units. Tasks and reports are
                  linked here.
                </p>
                <Link
                  to="/admin/properties"
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  Manage Properties
                </Link>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div
                className="p-3 h-100 rounded d-flex flex-column"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-1"
                  style={{ color: "var(--ro-text)" }}
                >
                  Operators
                </h6>
                <p
                  className="mb-3 small flex-grow-1"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Manage your field team. Add operators and control their
                  access.
                </p>
                <Link
                  to="/admin/operators"
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  Manage Team
                </Link>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div
                className="p-3 h-100 rounded d-flex flex-column"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-1"
                  style={{ color: "var(--ro-text)" }}
                >
                  Tasks
                </h6>
                <p
                  className="mb-3 small flex-grow-1"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Create, assign, and track work across all properties and
                  operators.
                </p>
                <Link
                  to="/admin/tasks"
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  View Tasks
                </Link>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div
                className="p-3 h-100 rounded d-flex flex-column"
                style={{
                  backgroundColor: "var(--ro-surface)",
                  border: "1px solid var(--ro-border)",
                }}
              >
                <h6
                  className="fw-semibold mb-1"
                  style={{ color: "var(--ro-text)" }}
                >
                  Issue Reports
                </h6>
                <p
                  className="mb-3 small flex-grow-1"
                  style={{ color: "var(--ro-text-muted)" }}
                >
                  Review problems flagged by operators. Dismiss or convert them
                  into tasks.
                </p>
                <Link
                  to="/admin/issue-reports"
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  Review Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

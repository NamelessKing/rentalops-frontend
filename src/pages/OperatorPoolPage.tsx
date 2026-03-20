// OperatorPoolPage.tsx
// Shows pool tasks filtered to the operator's specialization category.
//
// The backend applies the category filter automatically — no client-side filtering needed.
// An empty list means either no tasks match the category or the operator has no
// category configured. Both cases show the same empty state message.
//
// The "Claim" button is not yet active — rendered disabled with a tooltip.

import { useTaskPool } from "@/features/tasks/hooks/useTaskPool";

export function OperatorPoolPage() {
  const { data, loading, error, reload } = useTaskPool();

  if (loading) {
    return (
      <section aria-live="polite">
        <h1 className="h4 mb-3">Task Pool</h1>
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            Loading available tasks…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="assertive">
        <h1 className="h4 mb-3">Task Pool</h1>
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

  const tasks = data ?? [];

  return (
    <section>
      <h1 className="h4 mb-3">Task Pool</h1>

      {tasks.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body py-4 text-center text-muted">
            No tasks available for your category.
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-3">
          {tasks.map((task) => (
            <div key={task.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-1">{task.summary}</h6>
                  <p className="text-muted small mb-0">
                    {task.propertyName ?? "—"} &middot; {task.category} &middot;{" "}
                    {task.priority}
                    {task.estimatedHours ? ` · ${task.estimatedHours}h` : ""}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  {/* Claim button — not yet active, will be wired in a future update. */}
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-100"
                    disabled
                    title="Coming soon — available in next update"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

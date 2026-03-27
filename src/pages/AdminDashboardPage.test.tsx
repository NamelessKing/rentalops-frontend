// AdminDashboardPage.test.tsx
// Verifies critical dashboard UI states that must remain stable for ADMIN users.
//
// Why this file exists:
//   Dashboard is the main ADMIN entry point, so we protect two core experiences:
//   recoverability during API errors and the guided setup CTA path on empty data.

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminSummary } from "@/features/dashboard/hooks/useAdminSummary";
import { AdminDashboardPage } from "./AdminDashboardPage";

const mockReload = vi.fn();

vi.mock("@/features/dashboard/hooks/useAdminSummary", () => ({
  useAdminSummary: vi.fn(),
}));

const mockUseAdminSummary = vi.mocked(useAdminSummary);

// Helper keeps test intent focused on scenario assertions instead of setup noise.
function renderDashboardPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <AdminDashboardPage />
    </MemoryRouter>,
  );
}

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    mockReload.mockReset();
    mockUseAdminSummary.mockReset();
  });

  it("shows the dashboard error and retries when the user clicks Retry", () => {
    // Error state should be visible and actionable so users can recover quickly.
    mockUseAdminSummary.mockReturnValue({
      data: null,
      loading: false,
      error: "Unable to load dashboard data right now. Please try again.",
      reload: mockReload,
    });

    renderDashboardPage();

    expect(
      screen.getByText(
        "Unable to load dashboard data right now. Please try again.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("shows guided empty-state CTAs when there are no properties", () => {
    // When property setup is missing, the dashboard should guide the admin
    // through the first three setup actions in a single visible block.
    mockUseAdminSummary.mockReturnValue({
      data: {
        propertiesCount: 0,
        operatorsCount: 0,
        taskCounts: {
          pending: 0,
          assigned: 0,
          inProgress: 0,
          completed: 0,
        },
        issueReportCounts: {
          open: 0,
          converted: 0,
          dismissed: 0,
        },
      },
      loading: false,
      error: null,
      reload: mockReload,
    });

    renderDashboardPage();

    expect(
      screen.getByRole("link", { name: "Create Property" }),
    ).toHaveAttribute("href", "/admin/properties/new");
    expect(
      screen.getByRole("link", { name: "Create Operator" }),
    ).toHaveAttribute("href", "/admin/operators/new");
    expect(screen.getByRole("link", { name: "Create Task" })).toHaveAttribute(
      "href",
      "/admin/tasks/new",
    );
  });
});

import { it, describe, expect } from "vitest";
import { createMemoryRouter, Link, RouterProvider } from "react-router";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "@/components/ErrorBoundary";
import renderWithProviders from "@/utils/test-utils";

describe("error-boundary component", () => {
  it("should render Unexpected error occurred", () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    const router = createMemoryRouter([
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            index: true,
            Component: () => {
              throw new Error("Error thrown!");
            },
          },
        ],
      },
    ]);

    renderWithProviders(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      }),
    ).toBeInTheDocument();
  });

  it("should render thrown error", () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    const router = createMemoryRouter([
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            index: true,
            Component: () => {
              throw new Error("Error thrown!");
            },
          },
        ],
      },
    ]);

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByText("Error thrown!")).toBeInTheDocument();
  });

  it("should render a navigate back button", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    const user = userEvent.setup();

    const router = createMemoryRouter([
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            index: true,
            Component: () => {
              return (
                <>
                  <Link to="/error">Error page</Link>
                  <p>Main page</p>
                </>
              );
            },
          },
          {
            path: "/error",
            Component: () => {
              throw new Error("Error thrown!");
            },
          },
        ],
      },
    ]);

    renderWithProviders(<RouterProvider router={router} />);

    expect(router.state.location.pathname).toBe("/");

    const errorPageLink = screen.getByRole("link", { name: "Error page" });

    await user.click(errorPageLink);

    expect(router.state.location.pathname).toBe("/error");

    const navigateBackButton = screen.getByRole("button", { name: "Go back" });

    await user.click(navigateBackButton);

    expect(router.state.location.pathname).toBe("/");
  });
});

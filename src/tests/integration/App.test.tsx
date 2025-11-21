import { screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect } from "vitest";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";

describe("render App component", () => {
  it("should render Login page when user is not authenticated", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    expect(router.state.location.pathname).toBe("/log-in");
  });

  it("should render AppLayout component when user is authenticated", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);
  });
});

import { waitFor, screen } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import type { User } from "@/types/modelsType";

const serverRoute = `${import.meta.env.VITE_SERVER_URL}/auth/get-user`;

const mockedUser: User = {
  id: "mockId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "mockUsername",
};

describe("protected-route component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw an error if response rejects with unexpected status", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    fetchMock.get(serverRoute, 500);

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText("ErrorBoundary")).toBeVisible();
    });
  });

  it("should redirect to login route when user is not authenticated", async () => {
    expect.hasAssertions();

    fetchMock.get(serverRoute, 401);

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/log-in");
    });
  });

  it("should continue to requested route when user is authenticated", async () => {
    expect.hasAssertions();

    fetchMock.get(serverRoute, { status: 200, body: mockedUser });

    const router = createMemoryRouter(routes, { initialEntries: ["/friends"] });

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/friends");
    });
  });
});

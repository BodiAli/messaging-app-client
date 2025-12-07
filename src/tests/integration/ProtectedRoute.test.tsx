import { waitFor, screen } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import renderWithProviders from "@/utils/test-utils";
import ProtectedRoute from "@/app/ProtectedRoute";
import routes from "@/routes/routes";
import { getJwtToken } from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { User } from "@/types/modelsType";

vi.mock(import("@/services/localStorage"), () => {
  return {
    getJwtToken: vi.fn<() => string>(() => "invalidToken"),
  };
});

const serverRoute = `${serverUrl}/auth/get-user`;

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

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should throw an error when request rejects with unexpected status and render error content", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    fetchMock.get(serverRoute, {
      status: 500,
      body: { error: "Internal server error" },
    });

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await expect(
      screen.findByText("Unexpected error occurred"),
    ).resolves.toBeVisible();

    expect(screen.getByText("Internal server error")).toBeInTheDocument();
  });

  it("should render Loader component on initial render", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("should redirect to login route when there is no token", async () => {
    expect.hasAssertions();

    vi.mocked(getJwtToken).mockReturnValue(null);

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/log-in");
    });
  });

  it("should redirect to login route when server responds with 401 status", async () => {
    expect.hasAssertions();

    fetchMock.get(serverRoute, {
      status: 401,
      body: "Unauthorized",
      headers: { "Content-type": "text/plain" },
    });

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/log-in");
    });
  });

  it("should render children when user is authenticated", async () => {
    expect.hasAssertions();

    fetchMock.get(serverRoute, { status: 200, body: { user: mockedUser } });

    renderWithProviders(
      <ProtectedRoute>
        <p>Protected!</p>
      </ProtectedRoute>,
    );

    await expect(screen.findByText("Protected!")).resolves.toBeInTheDocument();
  });
});

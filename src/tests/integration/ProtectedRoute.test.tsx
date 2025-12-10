import { waitFor, screen } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import renderWithProviders from "@/utils/test-utils";
import routes from "@/routes/routes";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { User } from "@/types/modelsType";

const serverRoute = `${serverUrl}/auth/get-user`;

const mockedUser: User = {
  id: "mockId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "mockUsername",
};

describe("protected-route component", () => {
  const getJwtTokenSpy = vi.spyOn(localStorageService, "getJwtToken");

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should redirect to login route when there is no token", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/log-in");
    });
  });

  it("should redirect to login route when user is null", async () => {
    expect.hasAssertions();

    getJwtTokenSpy.mockReturnValue("invalidJwtToken");

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

  it("should allow authenticated users to access the '/' route", async () => {
    expect.hasAssertions();

    getJwtTokenSpy.mockReturnValue("jwtToken");
    fetchMock.get(serverRoute, { status: 200, body: { user: mockedUser } });

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      const loader = screen.queryByTestId("loader");

      expect(loader).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/");
    });
  });
});

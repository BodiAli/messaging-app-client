import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { screen } from "@testing-library/react";
import renderWithProviders from "@/utils/test-utils";
import AppLayout from "@/app/AppLayout";
import serverUrl from "@/utils/serverUrl";
import * as localStorageService from "@/services/localStorage";
import routes from "@/routes/routes";

const serverRoute = `${serverUrl}/auth/get-user`;

describe("app-layout component", () => {
  const getJwtTokenSpy = vi.spyOn(localStorageService, "getJwtToken");

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should throw an error when request rejects with unexpected status and render ErrorBoundary", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    fetchMock.get(serverRoute, {
      status: 500,
      body: { error: "Internal server error" },
    });

    getJwtTokenSpy.mockReturnValue("jwtToken");

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    await expect(
      screen.findByText("Unexpected error occurred"),
    ).resolves.toBeVisible();

    expect(screen.getByText("Internal server error")).toBeInTheDocument();
  });

  it("should render Loader component on initial render", () => {
    expect.hasAssertions();

    getJwtTokenSpy.mockReturnValue("jwtToken");

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("should render Header component whatever component passed as children if error is 401 unauthorized", async () => {
    expect.hasAssertions();

    getJwtTokenSpy.mockReturnValue("invalidToken");

    fetchMock.get(serverRoute, {
      status: 401,
      body: "Unauthorized",
      headers: {
        "Content-type": "text/plain",
      },
    });

    const router = createMemoryRouter(
      [
        {
          Component: AppLayout,
          children: [
            {
              path: "/test",
              Component: () => <h3>Test</h3>,
            },
          ],
        },
      ],
      { initialEntries: ["/test"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const headerComponentHeading = await screen.findByRole("heading", {
      name: "Messaging App",
      level: 2,
    });
    const testHeading = screen.getByRole("heading", { level: 3, name: "Test" });

    expect(headerComponentHeading).toBeInTheDocument();
    expect(testHeading).toBeInTheDocument();
  });

  it("should render Header component and whatever component passed as children if there is no error", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          Component: AppLayout,
          children: [
            {
              path: "/test",
              Component: () => <h3>Test</h3>,
            },
          ],
        },
      ],
      {
        initialEntries: ["/test"],
      },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const headerComponentHeading = screen.getByRole("heading", {
      level: 2,
      name: "Messaging App",
    });
    const testHeading = screen.getByRole("heading", { level: 3, name: "Test" });

    expect(headerComponentHeading).toBeInTheDocument();
    expect(testHeading).toBeInTheDocument();
  });
});

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import Header from "@/components/Header";
import { createMemoryRouter, RouterProvider } from "react-router";
import renderWithProviders from "@/utils/test-utils";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import serverUrl from "@/utils/serverUrl";
import type { User } from "@/types/modelsType";

const serverRoute = `${serverUrl}/auth/get-user`;

vi.mock(import("@/services/localStorage"), () => {
  return {
    getJwtToken: vi.fn<() => string>(() => "jwtToken"),
  };
});

const mockedUser: User = {
  id: "mockId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "mockUsername",
};

describe("header component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render website name and logo", () => {
    expect.hasAssertions();

    const router = createMemoryRouter([
      {
        path: "/",
        Component: Header,
      },
    ]);

    renderWithProviders(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: "Messaging App", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Messaging App Logo" }),
    ).toBeInTheDocument();
  });

  it("should navigate to home page when website name or logo is clicked", async () => {
    expect.hasAssertions();

    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/header",
          Component: Header,
        },
        {
          path: "/",
          Component: () => <h1>Home page</h1>,
        },
      ],
      { initialEntries: ["/header"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const homeLink = screen.getByRole("link", { name: "Home page" });

    await userEvent.click(homeLink);

    expect(router.state.location.pathname).toBe("/");
    expect(
      screen.getByRole("heading", { name: "Home page", level: 1 }),
    ).toBeInTheDocument();
  });

  it("should render Log in and Sign up links when user is not authenticated", async () => {
    expect.hasAssertions();

    fetchMock.get(serverRoute, {
      status: 401,
      headers: {
        "Content-type": "text/plain",
        body: "Unauthorized",
      },
    });

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    const logInLink = screen.getByRole("link", { name: "Log in" });
    const signUpLink = screen.getByRole("link", { name: "Sign up" });

    await userEvent.click(logInLink);

    expect(router.state.location.pathname).toBe("/log-in");

    await userEvent.click(signUpLink);

    expect(router.state.location.pathname).toBe("/sign-up");
  });

  it.todo(
    "should render notifications icon with number of notifications when user is authenticated",
    async () => {
      expect.hasAssertions();

      fetchMock.get(serverRoute, {
        status: 200,
        body: {
          user: mockedUser,
        },
      });

      const router = createMemoryRouter(routes);

      renderWithProviders(<RouterProvider router={router} />);

      const notificationsButton = await screen.findByRole("img", {
        name: "See notifications",
      });

      expect(notificationsButton).toBeInTheDocument();
    },
  );
});

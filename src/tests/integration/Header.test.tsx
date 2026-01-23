import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import { Menu } from "@mui/material";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import Header from "@/components/Header";
import renderWithProviders from "@/utils/test-utils";
import routes from "@/routes/routes";
import serverUrl from "@/utils/serverUrl";
import * as localStorageService from "@/services/localStorage";
import type { User } from "@/types/modelsType";

function assertIsElement(element: unknown): asserts element is Element {
  if (!(element instanceof Element)) throw new Error("Not an element");
}

const serverRoute = `${serverUrl}/auth/get-user`;

const mockedUser: User = {
  id: "mockId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "mockUsername",
};

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <p>Main layout</p>,
  };
});

vi.mock(import("@/components/Notifications"), () => {
  return {
    default: ({ open, onClose }) => <Menu open={open} onClose={onClose} />,
  };
});

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

    const router = createMemoryRouter(routes);

    renderWithProviders(<RouterProvider router={router} />);

    const logInLink = screen.getByRole("link", { name: "Log in" });
    const signUpLink = screen.getByRole("link", { name: "Sign up" });

    await userEvent.click(logInLink);

    expect(router.state.location.pathname).toBe("/log-in");

    await userEvent.click(signUpLink);

    expect(router.state.location.pathname).toBe("/sign-up");
  });

  it("should render a log out button when user is authenticated", async () => {
    expect.hasAssertions();

    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("jwtToken");
    fetchMock.get(serverRoute, {
      status: 200,
      body: {
        user: mockedUser,
      },
    });
    const router = createMemoryRouter(routes);
    renderWithProviders(<RouterProvider router={router} />);

    const logOutButton = await screen.findByRole("button", {
      name: "log out",
    });

    expect(logOutButton).toBeInTheDocument();
  });

  describe("notifications", () => {
    beforeEach(() => {
      vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("jwtToken");
      fetchMock.get(serverRoute, {
        status: 200,
        body: {
          user: mockedUser,
        },
      });
    });

    it("should render notifications icon button when user is authenticated", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes);
      renderWithProviders(<RouterProvider router={router} />);

      const notificationsButton = await screen.findByRole("button", {
        name: "Show notifications",
      });
      const notificationsIcon = within(notificationsButton).getByRole("img", {
        name: "Show notifications",
      });

      expect(notificationsButton).toBeInTheDocument();
      expect(notificationsIcon).toBeInTheDocument();
    });

    it("should display Notifications menu when notifications icon is clicked", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes);
      renderWithProviders(<RouterProvider router={router} />);

      const notificationsButton = await screen.findByRole("button", {
        name: "Show notifications",
      });
      const notificationsMenu = screen.queryByRole("menu");
      await userEvent.click(notificationsButton);
      const notificationsMenuVisible = screen.getByRole("menu");

      expect(notificationsMenu).not.toBeInTheDocument();
      expect(notificationsMenuVisible).toBeInTheDocument();
    });

    it("should close Notifications menu when clicking away", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes);
      renderWithProviders(<RouterProvider router={router} />);

      const notificationsButton = await screen.findByRole("button", {
        name: "Show notifications",
      });
      await userEvent.click(notificationsButton);

      const notificationsMenu = screen.getByRole("menu");
      const notificationsMenuBackdrop =
        screen.getByRole("presentation").firstChild;

      assertIsElement(notificationsMenuBackdrop);

      await userEvent.click(notificationsMenuBackdrop);

      expect(notificationsMenu).not.toBeInTheDocument();
    });
  });
});

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import routes from "@/routes/routes";
import serverUrl from "@/utils/serverUrl";
import * as localStorageService from "@/services/localStorage";
import type { User } from "@/types/modelsType";

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

vi.mock(import("@/pages/LoginPage"), () => {
  return {
    default: () => <p>Login page</p>,
  };
});

describe("log-out button", () => {
  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("jwtToken");
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering ui", () => {
    it("should render a button with a log out icon", async () => {
      expect.hasAssertions();

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
      const logOutIcon = screen.getByTestId("LogoutIcon");

      expect(logOutButton).toBeInTheDocument();
      expect(logOutIcon).toBeInTheDocument();
    });
  });

  describe("logging user out", () => {
    it("should log current user out when clicked", async () => {
      expect.hasAssertions();

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
      await userEvent.click(logOutButton);
      const loginPage = screen.getByText("Login page");

      expect(loginPage).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/log-in");
    });
  });
});

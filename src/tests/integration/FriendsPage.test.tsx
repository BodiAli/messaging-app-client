import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, beforeAll, afterEach, expect, beforeEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { User } from "@/types/modelsType";

const getUserServerRoute = `${serverUrl}/auth/get-user`;
const getFriendsServerRoute = `${serverUrl}/users/me/friends`;

const mockedUser: User = {
  id: "userId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "username",
};

describe("friends-page component", () => {
  const renderFriendsPath = () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/friends"] });
    return renderWithProviders(<RouterProvider router={router} />);
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockImplementation(
      () => "jwtToken",
    );

    fetchMock.get(getUserServerRoute, {
      status: 200,
      body: { user: mockedUser, token: "jwtToken" },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render 'Your friends' heading", async () => {
    expect.hasAssertions();

    renderFriendsPath();

    const heading = await screen.findByRole("heading", {
      name: "Your friends",
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });

  it("should render ErrorBoundary if server does not respond with 2xx status", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);
    fetchMock.get(getFriendsServerRoute, {
      status: 500,
      body: {
        error: "Server error!",
      },
    });
    renderFriendsPath();

    const errorBoundaryHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Unexpected error occurred",
    });
    const errorMessage = screen.getByText("Server error!");

    expect(errorBoundaryHeading).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it.todo("should navigate to homepage if user is unauthenticated");
});

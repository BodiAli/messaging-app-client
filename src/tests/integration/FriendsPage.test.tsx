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

const mockedUser: User = {
  id: "userId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "username",
};

describe("friends-page component", () => {
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

    const router = createMemoryRouter(routes, { initialEntries: ["/friends"] });
    renderWithProviders(<RouterProvider router={router} />);

    const heading = await screen.findByRole("heading", {
      name: "Your friends",
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });
});

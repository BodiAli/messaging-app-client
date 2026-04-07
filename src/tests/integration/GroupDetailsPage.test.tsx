import { screen } from "@testing-library/react";
import { describe, it, beforeAll, beforeEach, afterEach, expect } from "vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import * as localStorageService from "@/services/localStorage";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import type { GroupDetails, User } from "@/types/modelsType";

vi.mock(import("@/components/Header"), () => {
  return {
    default: () => <p>Mock: Header component</p>,
  };
});

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

const serverGetUserRoute = "/auth/get-user";
const serverGroupRoute = "/users/me/groups/Test-GroupId";
const serverGroupInvitationsRoute =
  "/users/me/groups/Test-GroupId/notifications";
const serverDeleteGroupMember =
  "/users/me/groups/Test-GroupId/members/Test-UserBId";

describe("group-details-page component", () => {
  const mockGroupDetails: GroupDetails = {
    group: {
      admin: {
        id: "Test-AdminId",
        imageUrl: "Test-AdminImageUrl",
        username: "Test: Admin username",
      },
      createdAt: "2020-01-01T01:30:30",
      id: "Test-GroupId",
      name: "Test: Group name",
      users: [
        {
          id: "Test-UserAId",
          imageUrl: "Test-UserAImageUrl",
          username: "Test: UserA username",
        },
      ],
    },
  };

  const mockCurrentUser: { user: User } = {
    user: {
      id: "Test-userAId",
      imageUrl: null,
      isGuest: false,
      lastSeen: "2020-01-01T01:30:30",
      username: "Test: UserA username",
    },
  };

  const renderGroupDetails = () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/groups/Test-GroupId/details"],
    });
    return renderWithProviders(<RouterProvider router={router} />);
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue(
      "Test-jwtToken",
    );
    fetchMock.get(serverGetUserRoute, {
      status: 200,
      body: mockCurrentUser,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("sending GET request to get group data", () => {
    it("should render ErrorBoundary when server responds with 500 status", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 500,
        body: {
          error: "Test: Server error",
        },
      });
      renderGroupDetails();

      const errorBoundaryHeading = await screen.findByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: Server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it.todo("should render fetched group data");
  });
});

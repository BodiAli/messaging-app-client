import { describe, it, beforeAll, beforeEach, afterEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import * as localStorageService from "@/services/localStorage";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import type { User } from "@/types/modelsType";

const serverGetUserRoute = "/auth/get-user";
const serverGroupRoute = "/users/me/groups/Test-GroupId";
const serverGroupInvitationsRoute =
  "/users/me/groups/Test-GroupId/notifications";
const serverDeleteGroupMember =
  "/users/me/groups/Test-GroupId/members/Test-UserBId";

describe("group-details-page component", () => {
  const mockCurrentUser: { user: User } = {
    user: {
      id: "Test-userAId",
      imageUrl: null,
      isGuest: false,
      lastSeen: "2020-01-01T01:30:30",
      username: "Test-userAId",
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

  describe("fetching group data", () => {
    it.todo("should render fetched group data");
  });
});

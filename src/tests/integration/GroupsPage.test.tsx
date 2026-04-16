import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterEach, assert } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import GroupsPage from "@/pages/GroupsPage";
import ErrorBoundary from "@/components/ErrorBoundary";
import GroupChatPage from "@/pages/GroupChatPage";
import GroupsPageIndex from "@/components/GroupsPageIndex";
import serverUrl from "@/utils/serverUrl";
import type { GroupChat } from "@/types/modelsType";

const serverUserGroupsRoute = `${serverUrl}/users/me/groups`;

vi.mock(import("@/components/GroupsPageIndex"), () => {
  return {
    default: () => <p>groups page index</p>,
  };
});

vi.mock(import("@/pages/GroupChatPage"), () => {
  return {
    default: () => <p>group chat page</p>,
  };
});

describe("groups-page-component", () => {
  const renderGroupsRoute = () => {
    const router = createMemoryRouter(
      [
        {
          ErrorBoundary: ErrorBoundary,
          children: [
            {
              path: "/groups",
              Component: GroupsPage,
              children: [
                {
                  index: true,
                  Component: GroupsPageIndex,
                },
                {
                  path: ":groupId",
                  Component: GroupChatPage,
                },
              ],
            },
          ],
        },
      ],
      { initialEntries: ["/groups"] },
    );

    renderWithProviders(<RouterProvider router={router} />);
  };

  const mockGroupsResponse: {
    groups: GroupChat[];
  } = {
    groups: [
      {
        adminId: "adminId1",
        createdAt: "2020-01-01-T01:30:30",
        id: "groupId1",
        name: "groupName1",
      },
      {
        adminId: "adminId2",
        createdAt: "2020-01-01-T01:30:30",
        id: "groupId2",
        name: "groupName2",
      },
    ],
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering heading", () => {
    it("should render header info about current page", async () => {
      expect.hasAssertions();

      fetchMock.get(serverUserGroupsRoute, {
        status: 200,
        body: mockGroupsResponse,
      });
      renderGroupsRoute();

      const headingElement = await screen.findByRole("heading", {
        level: 2,
        name: "Your groups",
      });

      expect(headingElement).toBeInTheDocument();
    });
  });

  describe("rendering GroupsPageIndex", () => {
    it("should render GroupsPageIndex", () => {
      expect.hasAssertions();

      renderGroupsRoute();

      const groupsPageIndexElement = screen.getByText("groups page index");

      expect(groupsPageIndexElement).toBeInTheDocument();
    });
  });

  describe("rendering group cards", () => {
    it("should render ErrorBoundary when an unexpected error occurs", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverUserGroupsRoute, {
        status: 500,
        body: {
          error: "Server Error!",
        },
      });
      renderGroupsRoute();

      const errorBoundaryHeading = await screen.findByRole("heading", {
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Server Error!");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should render 'You are not in any groups' when groups are an empty array", async () => {
      expect.hasAssertions();

      fetchMock.get(serverUserGroupsRoute, {
        status: 200,
        body: {
          groups: [],
        },
      });
      renderGroupsRoute();

      const emptyText = await screen.findByText("You are not in any groups");

      expect(emptyText).toBeInTheDocument();
    });

    it("should render groups data", async () => {
      expect.hasAssertions();

      fetchMock.get(serverUserGroupsRoute, {
        status: 200,
        body: mockGroupsResponse,
      });
      renderGroupsRoute();

      const groups = await screen.findAllByRole("link");
      assert(groups[0]);
      assert(groups[1]);

      expect(groups[0]).toHaveTextContent("groupName1");
      expect(groups[1]).toHaveTextContent("groupName2");
    });
  });

  describe("navigating between group links", () => {
    it("should navigate to first group route when clicked", async () => {
      expect.hasAssertions();

      fetchMock.get(serverUserGroupsRoute, {
        status: 200,
        body: mockGroupsResponse,
      });
      renderGroupsRoute();

      const groups = await screen.findAllByRole<HTMLAnchorElement>("link");
      assert(groups[0]);
      const firstGroup = groups[0];
      await userEvent.click(firstGroup);
      const groupChatPageElement = screen.getByText("group chat page");

      expect(firstGroup.pathname).toBe("/groups/groupId1");
      expect(groupChatPageElement).toBeInTheDocument();
    });

    it("should navigate to second group route when clicked", async () => {
      expect.hasAssertions();

      fetchMock.get(serverUserGroupsRoute, {
        status: 200,
        body: mockGroupsResponse,
      });
      renderGroupsRoute();

      const groups = await screen.findAllByRole<HTMLAnchorElement>("link");
      assert(groups[1]);
      const secondGroup = groups[1];
      await userEvent.click(secondGroup);
      const groupChatPageElement = screen.getByText("group chat page");

      expect(secondGroup.pathname).toBe("/groups/groupId2");
      expect(groupChatPageElement).toBeInTheDocument();
    });
  });
});

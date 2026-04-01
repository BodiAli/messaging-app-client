import {
  describe,
  it,
  vi,
  beforeAll,
  afterEach,
  expect,
  beforeEach,
} from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import * as notistack from "notistack";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as jwtTokenService from "@/services/localStorage";
import type { ApiClientError } from "@/types/apiResponseTypes";
import type { GroupMessages, User } from "@/types/modelsType";

const serverGroupMessagesRoute = "/users/me/groups/Test-GroupId/messages";

vi.mock(import("@/components/Header"), () => {
  return {
    default: () => <p>Header Component</p>,
  };
});

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/pages/IndexPage"), () => {
  return {
    default: () => <p>Index Page</p>,
  };
});

vi.mock(import("@/pages/GroupsPage"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/pages/GroupDetails"), () => {
  return {
    default: () => <p>Group Details Page</p>,
  };
});

describe("group-chat-page component", () => {
  const mockGroupMessages: GroupMessages = {
    group: {
      createdAt: "2020-01-01T01:30:00Z",
      id: "Test-GroupId",
      name: "Test-GroupName",
    },
    messages: [
      {
        content: "Test-MessageContent1",
        createdAt: "2020-01-01T01:30:00Z",
        groupChatId: "Test-GroupId",
        id: "Test-MessageId1",
        imageUrl: null,
        receiverId: null,
        senderId: "Test-UserAId",
        sender: {
          id: "Test-UserAId",
          imageUrl: null,
          username: "Test-UserAUsername",
        },
      },
      {
        content: "Test-MessageContent2",
        createdAt: "2020-01-01T01:30:00Z",
        groupChatId: "Test-GroupId",
        id: "Test-MessageId2",
        imageUrl: "Test-MessageImageUrl",
        receiverId: null,
        senderId: "Test-UserBId",
        sender: {
          id: "Test-UserBId",
          imageUrl: "Test-UserBImageUrl",
          username: "Test-UserBUsername",
        },
      },
    ],
  };

  const mockCurrentUser: User = {
    id: "Test-UserAId",
    imageUrl: null,
    username: "Test-UserAUsername",
    isGuest: false,
    lastSeen: "2020-01-01T01:30:00Z",
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(jwtTokenService, "getJwtToken").mockReturnValue("jwtToken");
    fetchMock.get("/auth/get-user", {
      status: 200,
      body: {
        user: mockCurrentUser,
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("handling fetch errors when requesting group messages", () => {
    it("should render ErrorBoundary when the server responds with a 500 status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupMessagesRoute, {
        status: 500,
        body: {
          error: "Server error!",
        },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const errorBoundaryHeading = await screen.findByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Server error!");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueue snackbar on 4xx errors and navigate to home page", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockImplementation(() => {
        return {
          enqueueSnackbar: mockEnqueueSnackbar,
          closeSnackbar: vi.fn<() => void>(),
        };
      });
      fetchMock.get(serverGroupMessagesRoute, {
        status: 404,
        body: {
          errors: [{ message: "Group not found." }],
        } as ApiClientError,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });

      renderWithProviders(<RouterProvider router={router} />);
      const indexPageElement = await screen.findByText("Index Page");

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Group not found.", { variant: "error" });
      expect(router.state.location.pathname).toBe("/");
      expect(indexPageElement).toBeInTheDocument();
    });
  });

  describe("render group messages data", () => {
    it("should render group name as a link", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameLink = await screen.findByRole<HTMLAnchorElement>("link", {
        name: "Test-GroupName",
      });

      expect(groupNameLink).toBeInTheDocument();
      expect(groupNameLink.pathname).toBe("/groups/Test-GroupId/details");
    });

    it("should navigate to group details page when group name link is clicked", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameLink = await screen.findByRole("link", {
        name: "Test-GroupName",
      });
      await userEvent.click(groupNameLink);
      const groupDetailsPage = screen.getByText("Group Details Page");

      expect(router.state.location.pathname).toBe(
        "/groups/Test-GroupId/details",
      );
      expect(groupDetailsPage).toBeInTheDocument();
    });

    it("should render group messages content", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const firstGroupMessageContent = await screen.findByText(
        "Test-MessageContent1",
      );
      const secondGroupMessageContent = await screen.findByText(
        "Test-MessageContent2",
      );

      expect(firstGroupMessageContent).toBeInTheDocument();
      expect(secondGroupMessageContent).toBeInTheDocument();
    });

    it.todo("should render group messages images");
  });
});

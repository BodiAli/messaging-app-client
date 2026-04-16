import {
  describe,
  it,
  vi,
  beforeAll,
  afterEach,
  expect,
  beforeEach,
  assert,
} from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import * as notistack from "notistack";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as jwtTokenService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { ApiClientError } from "@/types/apiResponseTypes";
import type { GroupMessages, Message, User } from "@/types/modelsType";

const serverGroupMessagesRoute = `${serverUrl}/users/me/groups/Test-GroupId/messages`;

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

vi.mock(import("@/pages/GroupDetailsPage"), () => {
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
    fetchMock.get(`${serverUrl}/auth/get-user`, {
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

    it("should render group message image if present", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const messageImage = await screen.findByRole("img", {
        name: "user sent image",
      });

      expect(messageImage).toBeInTheDocument();
    });

    it("should render group message sender's profile picture", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const userAProfilePicture = await screen.findByTitle(
        "Test-UserAUsername no profile picture",
      );
      const userBProfilePicture = screen.getByRole("img", {
        name: "Test-UserBUsername's profile picture",
      });

      expect(userAProfilePicture).toBeInTheDocument();
      expect(userBProfilePicture).toBeInTheDocument();
    });

    it("should render group message sender's username", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const userAUsername = await screen.findByText("Test-UserAUsername");
      const userBUsername = screen.getByText("Test-UserBUsername");

      expect(userAUsername).toBeInTheDocument();
      expect(userBUsername).toBeInTheDocument();
    });
  });

  describe("handling validating form fields", () => {
    it("should call alert method with an error message when sending an empty message", async () => {
      expect.hasAssertions();

      const mockAlert = vi.spyOn(globalThis, "alert");
      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const messageInput = await screen.findByPlaceholderText("Message");
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(messageInput, " ");
      await userEvent.click(submitButton);

      expect(mockAlert).toHaveBeenCalledWith("Cannot send an empty message");
    });
  });

  describe("handling errors when sending a message", () => {
    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      fetchMock.post(serverGroupMessagesRoute, {
        status: 500,
        body: {
          error: "Test-Server error.",
        },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const messageInput = await screen.findByPlaceholderText("Message");
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(messageInput, "Test-Message content");
      await userEvent.click(submitButton);
      const errorBoundaryHeading = screen.getByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test-Server error.");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueue snackbar when server responds with 4xx status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockImplementation(() => {
        return {
          enqueueSnackbar: mockEnqueueSnackbar,
          closeSnackbar: vi.fn<() => string>(),
        };
      });
      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      fetchMock.post(serverGroupMessagesRoute, {
        status: 403,
        body: {
          errors: [{ message: "You cannot send message to this group." }],
        } as ApiClientError,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const messageInput = await screen.findByPlaceholderText("Message");
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(messageInput, "Test-Message content");
      await userEvent.click(submitButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("You cannot send message to this group.", { variant: "error" });
    });
  });

  describe("handling valid form submit", () => {
    it("should clear form messageInput field and remove upload image after form submit", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      fetchMock.post(serverGroupMessagesRoute, {
        status: 201,
        body: {
          content: "Test-Message content",
          createdAt: new Date().toISOString(),
          groupChatId: "Test-GroupId",
          id: "Test-MessageId3",
          imageUrl: null,
          receiverId: null,
          senderId: "Test-UserAId",
        } satisfies Omit<Message, "createdAt"> & { createdAt: string },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const messageInput = await screen.findByPlaceholderText("Message");
      const messageImage = screen.getByRole("button", {
        name: "attach image",
      });
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(messageInput, "Test-Message content");
      await userEvent.upload(
        messageImage,
        new File(["blob"], "filename.png", { type: "image/png" }),
      );
      const uploadedImagePreview = screen.getByRole("img", {
        name: "uploaded image",
      });

      expect(messageInput).toHaveValue("Test-Message content");
      expect(uploadedImagePreview).toBeInTheDocument();

      await userEvent.click(submitButton);

      expect(messageInput).not.toHaveValue();
      expect(uploadedImagePreview).not.toBeInTheDocument();
    });

    it("should re-fetch group messages after submit", async () => {
      expect.hasAssertions();

      fetchMock.getOnce(serverGroupMessagesRoute, {
        status: 200,
        body: mockGroupMessages,
      });
      assert(mockGroupMessages.messages[0]);
      fetchMock.getOnce(serverGroupMessagesRoute, {
        status: 200,
        body: {
          ...mockGroupMessages,
          messages: [
            ...mockGroupMessages.messages,
            {
              ...mockGroupMessages.messages[0],
              content: "Test-Message content 3",
              id: "Test-MessageId3",
            },
          ],
        } satisfies GroupMessages,
      });
      fetchMock.post(serverGroupMessagesRoute, {
        status: 201,
        body: {
          content: "Test-Message content",
          createdAt: new Date().toISOString(),
          groupChatId: "Test-GroupId",
          id: "Test-MessageId3",
          imageUrl: null,
          receiverId: null,
          senderId: "Test-UserAId",
        } satisfies Omit<Message, "createdAt"> & { createdAt: string },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/Test-GroupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const messageInput = await screen.findByPlaceholderText("Message");
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });
      const reFetchedMessageBeforeSubmit = screen.queryByText(
        "Test-Message content 3",
      );

      await userEvent.type(messageInput, "Test-Message content");
      await userEvent.click(submitButton);
      const reFetchedMessageAfterSubmit = screen.queryByText(
        "Test-Message content 3",
      );

      expect(reFetchedMessageBeforeSubmit).not.toBeInTheDocument();
      expect(reFetchedMessageAfterSubmit).toBeInTheDocument();
      expect(fetchMock).toHavePostedTimes(1, serverGroupMessagesRoute);
      expect(fetchMock).toHaveGotTimes(2, serverGroupMessagesRoute);
    });
  });
});

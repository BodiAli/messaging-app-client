import { createRoutesStub } from "react-router";
import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import * as notistack from "notistack";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import { badgeClasses } from "@mui/material";
import renderWithProviders from "@/utils/test-utils";
import UserChat from "@/components/UserChat";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import AppLayout from "@/app/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import type {
  ChatData,
  GroupMessages,
  Message,
  Messages,
  User,
} from "@/types/modelsType";
import type { ApiClientError } from "@/types/apiResponseTypes";

const getUserServerRoute = `${serverUrl}/auth/get-user`;
const addFriendServerRoute = `${serverUrl}/friendships`;
const serverMessagesRoute = `${serverUrl}/users/userBId/messages`;
const serverRespondToFriendRequestRoute = `${serverUrl}/friendships/Test-Friendship-Id`;

vi.mock(import("@/components/Chatting"), () => {
  return {
    default: ({
      messages,
    }: {
      messages: Messages | GroupMessages["messages"];
    }) => (
      <>
        {messages.map((message) => (
          <p key={message.id}>{message.content}</p>
        ))}
      </>
    ),
  };
});

const mockUser: User = {
  id: "userAId",
  username: "userA",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toISOString(),
};

const lastSeen = "2020-01-01T01:00:00Z";

const mockChatData: ChatData = {
  messages: [
    {
      content: "messageFromUserA",
      createdAt: new Date().toISOString(),
      groupChatId: null,
      id: "messageIdUserA",
      imageUrl: null,
      senderId: "userAId",
      receiverId: "userBId",
    },
    {
      content: "messageFromUserB",
      createdAt: new Date().toISOString(),
      groupChatId: null,
      id: "messageIdUserB",
      imageUrl: null,
      senderId: "userBId",
      receiverId: "userAId",
    },
  ],
  user: {
    imageUrl: null,
    lastSeen: null,
    username: "userB",
  },
  friendRequestStatus: null,
};

describe("user-chat component", () => {
  function renderUserChat(chatData: ChatData = mockChatData) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: AppLayout,
        ErrorBoundary,
        children: [
          {
            path: "/friends/:userId",
            Component: () => (
              <UserChat isFetching={false} chatData={chatData} />
            ),
          },
        ],
      },
    ]);

    return renderWithProviders(<Stub initialEntries={["/friends/userBId"]} />);
  }

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("jwtToken");
    fetchMock.get(getUserServerRoute, {
      status: 200,
      body: {
        user: mockUser,
      },
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe("back button navigation", () => {
    describe("given rendering back button", () => {
      it("should render a back button with an icon", async () => {
        expect.hasAssertions();

        renderUserChat();
        const backButton = await screen.findByRole("button", {
          name: "back",
        });
        const backIcon = within(backButton).getByTestId("ArrowBackIcon");

        expect(backButton).toBeInTheDocument();
        expect(backIcon).toBeInTheDocument();
      });
    });

    describe("given click back button", () => {
      it("should navigate back", async () => {
        expect.hasAssertions();

        const Stub = createRoutesStub([
          {
            Component: AppLayout,
            children: [
              {
                path: "/friends/:userId",
                Component: () => (
                  <UserChat isFetching={false} chatData={mockChatData} />
                ),
              },
              {
                path: "/test",
                Component: () => <p>Test</p>,
              },
            ],
          },
        ]);
        renderWithProviders(
          <Stub initialEntries={["/test", "/friends/userBId"]} />,
        );

        const backButton = await screen.findByRole("button", {
          name: "back",
        });
        await userEvent.click(backButton);
        const testElement = screen.getByText("Test");

        expect(testElement).toBeInTheDocument();
      });
    });
  });

  describe("rendering requested user data", () => {
    describe("given name of the current user being chatted with", () => {
      it("should render the name of the current user", async () => {
        expect.hasAssertions();

        renderUserChat();

        const currentUser = await screen.findByRole("heading", {
          name: `Chatting with ${mockChatData.user.username}`,
        });

        expect(currentUser).toBeInTheDocument();
      });
    });

    describe("given imageUrl", () => {
      it("should render a default avatar when no imageUrl is present", async () => {
        expect.hasAssertions();

        renderUserChat(mockChatData);

        const defaultImage = await screen.findByTitle(
          `${mockChatData.user.username} no profile picture`,
        );

        expect(defaultImage).toBeInTheDocument();
      });
    });

    describe("given user is a friend", () => {
      it("should not render a button to add as a friend if user is friend", async () => {
        expect.hasAssertions();

        renderUserChat({
          ...mockChatData,
          friendRequestStatus: {
            type: "ACCEPTED",
            senderId: "userBId",
            id: "Test-Friendship-Id",
          },
          user: {
            ...mockChatData.user,
            lastSeen,
          },
        });

        await waitForElementToBeRemoved(screen.getByTestId("loader"));
        const addFriend = screen.queryByRole("button", {
          name: "Add as a friend",
        });

        expect(addFriend).not.toBeInTheDocument();
      });

      it("should render an online badge if friend is last seen within the last 5 minutes", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:03:00Z"));
        renderUserChat({
          ...mockChatData,
          friendRequestStatus: {
            type: "ACCEPTED",
            senderId: "userBId",
            id: "Test-Friendship-Id",
          },
          user: {
            ...mockChatData.user,
            lastSeen,
          },
        });

        const onlineBadge = await screen.findByTestId("online-badge");

        expect(onlineBadge).toBeInTheDocument();
      });

      it("should not render an online badge if friend is not last seen within the last 5 minutes", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:10:00Z"));
        renderUserChat({
          ...mockChatData,
          friendRequestStatus: {
            type: "ACCEPTED",
            senderId: "userBId",
            id: "Test-Friendship-Id",
          },
          user: {
            ...mockChatData.user,
            lastSeen,
          },
        });
        await waitForElementToBeRemoved(screen.getByTestId("loader"));

        const onlineBadge = screen.queryByTestId("online-badge");

        expect(onlineBadge).toHaveClass(badgeClasses.invisible);
      });
    });

    describe("given user is not a friend", () => {
      it("should render an add as a friend button", async () => {
        expect.hasAssertions();

        renderUserChat();

        const addFriend = await screen.findByRole("button", {
          name: "Add as a friend",
        });

        expect(addFriend).toBeInTheDocument();
      });

      it("should not render an online badge", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:10:00Z"));
        renderUserChat(mockChatData);
        await waitForElementToBeRemoved(screen.getByTestId("loader"));

        const onlineBadge = screen.queryByTestId("online-badge");

        expect(onlineBadge).toHaveClass(badgeClasses.invisible);
      });
    });

    describe("given a friend request is already sent by the user being chatted with", () => {
      it("should render an accept or decline buttons", async () => {
        expect.hasAssertions();

        renderUserChat({
          ...mockChatData,
          friendRequestStatus: {
            type: "PENDING",
            senderId: "userBId",
            id: "Test-Friendship-Id",
          },
        });

        const acceptRequestButton = await screen.findByRole("button", {
          name: "Accept",
        });
        const declineRequestButton = await screen.findByRole("button", {
          name: "Decline",
        });

        expect(acceptRequestButton).toBeInTheDocument();
        expect(declineRequestButton).toBeInTheDocument();
      });

      it("should not render an online badge", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:10:00Z"));
        renderUserChat(mockChatData);
        await waitForElementToBeRemoved(screen.getByTestId("loader"));

        const onlineBadge = screen.queryByTestId("online-badge");

        expect(onlineBadge).toHaveClass(badgeClasses.invisible);
      });
    });

    describe("given a friend request is already sent by the current user", () => {
      it("should render a 'Cancel request' button", async () => {
        expect.hasAssertions();

        renderUserChat({
          ...mockChatData,
          friendRequestStatus: {
            type: "PENDING",
            senderId: mockUser.id,
            id: "Test-Friendship-Id",
          },
        });

        const cancelButton = await screen.findByRole("button", {
          name: "Cancel request",
        });

        expect(cancelButton).toBeInTheDocument();
      });

      it("should not render an online badge", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:10:00Z"));
        renderUserChat(mockChatData);
        await waitForElementToBeRemoved(screen.getByTestId("loader"));

        const onlineBadge = screen.queryByTestId("online-badge");

        expect(onlineBadge).toHaveClass(badgeClasses.invisible);
      });
    });

    describe("given the two users are already friends", () => {
      it("should render a 'Remove friend' button", async () => {
        expect.hasAssertions();

        renderUserChat({
          messages: [],
          friendRequestStatus: {
            type: "ACCEPTED",
            senderId: mockUser.id,
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });

        const removeFriend = await screen.findByRole("button", {
          name: "Remove friend",
        });

        expect(removeFriend).toBeInTheDocument();
      });

      it("should render an online badge", async () => {
        expect.hasAssertions();

        vi.setSystemTime(new Date("2020-01-01T01:10:00Z"));
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            type: "ACCEPTED",
            senderId: mockUser.id,
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });
        await waitForElementToBeRemoved(screen.getByTestId("loader"));

        const onlineBadge = screen.getByTestId("online-badge");

        expect(onlineBadge).not.toHaveClass(badgeClasses.invisible);
      });
    });
  });

  describe("rendering messages data", () => {
    describe("given messages array", () => {
      it("should render Chatting component", async () => {
        expect.hasAssertions();

        renderUserChat(mockChatData);

        const message1 = await screen.findByText("messageFromUserA");
        const message2 = await screen.findByText("messageFromUserB");

        expect(message1).toBeInTheDocument();
        expect(message2).toBeInTheDocument();
      });
    });
  });

  describe("friendship actions logic", () => {
    describe("given adding friend", () => {
      it("should render ErrorBoundary when server responds with unexpected error", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.post(addFriendServerRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        renderUserChat(mockChatData);
        const addFriendButton = await screen.findByRole("button", {
          name: "Add as a friend",
        });

        await userEvent.click(addFriendButton);
        const errorBoundaryHeading = screen.getByRole("heading", {
          name: "Unexpected error occurred",
          level: 1,
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });

      it("should call enqueueSnackbar when server responds with client error", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<notistack.EnqueueSnackbar>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.post(addFriendServerRoute, {
          status: 409,
          body: {
            errors: [{ message: "A friend request is already sent by userB" }],
          },
        });
        renderUserChat();
        const addFriendButton = await screen.findByRole("button", {
          name: "Add as a friend",
        });

        await userEvent.click(addFriendButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith(
          "A friend request is already sent by userB",
          { variant: "error" },
        );
      });

      it("should disable button while fetching", async () => {
        expect.hasAssertions();

        fetchMock.post(addFriendServerRoute, {
          status: 201,
          body: {
            message: "Friend request sent to userA",
          },
        });
        renderUserChat();

        const addFriendButton = await screen.findByRole("button", {
          name: "Add as a friend",
        });
        fireEvent.click(addFriendButton);

        expect(addFriendButton).toBeDisabled();
      });

      it("should call enqueueSnackbar with success message when the server response succeeds", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<notistack.EnqueueSnackbar>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.post(addFriendServerRoute, {
          status: 201,
          body: {
            message: "Friend request sent to userA",
          },
        });
        renderUserChat();
        const addFriendButton = await screen.findByRole("button", {
          name: "Add as a friend",
        });

        await userEvent.click(addFriendButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith(
          "Friend request sent to userA",
          { variant: "success" },
        );
      });
    });

    describe("given accepting a friend request", () => {
      it("should render ErrorBoundary when server responds with 500 status", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.patch(serverRespondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Test: server error",
          },
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const acceptButton = await screen.findByRole("button", {
          name: "Accept",
        });
        await userEvent.click(acceptButton);

        const errorBoundaryHeading = screen.getByRole("heading", {
          name: "Unexpected error occurred",
          level: 1,
        });
        const errorText = screen.getByText("Test: server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorText).toBeInTheDocument();
      });

      it("should call mockEnqueueSnackbar when server responds with 4xx status", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.patch(serverRespondToFriendRequestRoute, {
          status: 404,
          body: {
            errors: [
              {
                message: "Test: no friend request found.",
              },
            ],
          } satisfies ApiClientError,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const acceptButton = await screen.findByRole("button", {
          name: "Accept",
        });
        await userEvent.click(acceptButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Test: no friend request found.", { variant: "error" });
      });

      it("should disable accept button while fetching", async () => {
        expect.hasAssertions();

        const { promise, resolve } = Promise.withResolvers();
        vi.spyOn(globalThis, "fetch")
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ user: mockUser }), { status: 200 }),
          )
          .mockImplementation(async () => {
            await promise;
            return Promise.resolve(new Response(null, { status: 204 }));
          });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });
        const acceptButton = await screen.findByRole("button", {
          name: "Accept",
        });

        await userEvent.click(acceptButton);

        expect(acceptButton).toBeDisabled();

        resolve(null);

        await waitFor(() => {
          expect(acceptButton).toBeEnabled();
        });
      });

      it("should call mockEnqueueSnackbar with a success message when server responds with 204", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.patch(serverRespondToFriendRequestRoute, {
          status: 204,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });
        const acceptButton = await screen.findByRole("button", {
          name: "Accept",
        });

        await userEvent.click(acceptButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Friend request accepted.", { variant: "success" });
      });
    });

    describe("given declining a friend request", () => {
      it("should render ErrorBoundary when server responds with 500 status", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Test: server error",
          },
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });
        await userEvent.click(declineButton);

        const errorBoundaryHeading = screen.getByRole("heading", {
          name: "Unexpected error occurred",
          level: 1,
        });
        const errorText = screen.getByText("Test: server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorText).toBeInTheDocument();
      });

      it("should call mockEnqueueSnackbar when server responds with 4xx status", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 404,
          body: {
            errors: [
              {
                message: "Test: no friend request found.",
              },
            ],
          } satisfies ApiClientError,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });
        await userEvent.click(declineButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Test: no friend request found.", { variant: "error" });
      });

      it("should disable decline button while fetching", async () => {
        expect.hasAssertions();

        const { promise, resolve } = Promise.withResolvers();
        vi.spyOn(globalThis, "fetch")
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ user: mockUser }), { status: 200 }),
          )
          .mockImplementation(async () => {
            await promise;
            return Promise.resolve(new Response(null, { status: 204 }));
          });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });
        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);

        expect(declineButton).toBeDisabled();

        resolve(null);

        await waitFor(() => {
          expect(declineButton).toBeEnabled();
        });
      });

      it("should call mockEnqueueSnackbar with a success message when server responds with 204", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 204,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });
        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Friend request declined.", { variant: "success" });
      });
    });

    describe("given removing friend", () => {
      it("should render ErrorBoundary when server responds with 500 status", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Test: server error",
          },
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "ACCEPTED",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });

        const removeFriend = await screen.findByRole("button", {
          name: "Remove friend",
        });
        await userEvent.click(removeFriend);

        const errorBoundaryHeading = screen.getByRole("heading", {
          name: "Unexpected error occurred",
          level: 1,
        });
        const errorText = screen.getByText("Test: server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorText).toBeInTheDocument();
      });

      it("should call mockEnqueueSnackbar when server responds with 4xx status", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 404,
          body: {
            errors: [
              {
                message: "Test: no friend request found.",
              },
            ],
          } satisfies ApiClientError,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "ACCEPTED",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });

        const removeFriend = await screen.findByRole("button", {
          name: "Remove friend",
        });
        await userEvent.click(removeFriend);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Test: no friend request found.", { variant: "error" });
      });

      it("should disable remove friend button while fetching", async () => {
        expect.hasAssertions();

        const { promise, resolve } = Promise.withResolvers();
        vi.spyOn(globalThis, "fetch")
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ user: mockUser }), { status: 200 }),
          )
          .mockImplementation(async () => {
            await promise;
            return Promise.resolve(new Response(null, { status: 204 }));
          });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "ACCEPTED",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });
        const removeFriend = await screen.findByRole("button", {
          name: "Remove friend",
        });

        await userEvent.click(removeFriend);

        expect(removeFriend).toBeDisabled();

        resolve(null);

        await waitFor(() => {
          expect(removeFriend).toBeEnabled();
        });
      });

      it("should call mockEnqueueSnackbar with a success message when server responds with 204", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 204,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: "userBId",
            type: "ACCEPTED",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: new Date().toISOString(),
            username: "Test: userB username",
          },
        });
        const removeFriend = await screen.findByRole("button", {
          name: "Remove friend",
        });

        await userEvent.click(removeFriend);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Friend removed.", { variant: "success" });
      });
    });

    describe("given canceling a friend request", () => {
      it("should render ErrorBoundary when server responds with 500 status", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Test: server error",
          },
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: mockUser.id,
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const cancelButton = await screen.findByRole("button", {
          name: "Cancel request",
        });
        await userEvent.click(cancelButton);

        const errorBoundaryHeading = screen.getByRole("heading", {
          name: "Unexpected error occurred",
          level: 1,
        });
        const errorText = screen.getByText("Test: server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorText).toBeInTheDocument();
      });

      it("should call mockEnqueueSnackbar when server responds with 4xx status", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 404,
          body: {
            errors: [
              {
                message: "Test: no friend request found.",
              },
            ],
          } satisfies ApiClientError,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: mockUser.id,
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const cancelButton = await screen.findByRole("button", {
          name: "Cancel request",
        });
        await userEvent.click(cancelButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Test: no friend request found.", { variant: "error" });
      });

      it("should disable cancel request button while fetching", async () => {
        expect.hasAssertions();

        const { promise, resolve } = Promise.withResolvers();
        vi.spyOn(globalThis, "fetch")
          .mockResolvedValueOnce(
            new Response(JSON.stringify({ user: mockUser }), { status: 200 }),
          )
          .mockImplementation(async () => {
            await promise;
            return Promise.resolve(new Response(null, { status: 204 }));
          });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: mockUser.id,
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const cancelButton = await screen.findByRole("button", {
          name: "Cancel request",
        });
        await userEvent.click(cancelButton);

        expect(cancelButton).toBeDisabled();

        resolve(null);

        await waitFor(() => {
          expect(cancelButton).toBeEnabled();
        });
      });

      it("should call mockEnqueueSnackbar with a success message when server responds with 204", async () => {
        expect.hasAssertions();

        const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
        vi.spyOn(notistack, "useSnackbar").mockReturnValue({
          closeSnackbar: vi.fn<() => void>(),
          enqueueSnackbar: mockEnqueueSnackbar,
        });
        fetchMock.delete(serverRespondToFriendRequestRoute, {
          status: 204,
        });
        renderUserChat({
          messages: [],
          friendRequestStatus: {
            senderId: mockUser.id,
            type: "PENDING",
            id: "Test-Friendship-Id",
          },
          user: {
            imageUrl: null,
            lastSeen: null,
            username: "Test: userB username",
          },
        });

        const cancelButton = await screen.findByRole("button", {
          name: "Cancel request",
        });
        await userEvent.click(cancelButton);

        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("Friend request canceled.", { variant: "success" });
      });
    });
  });

  describe("sending message to user", () => {
    it("should call alert method when message field is empty", async () => {
      expect.hasAssertions();

      const mockAlert = vi
        .spyOn(window, "alert")
        .mockImplementation(() => null);
      renderUserChat();
      const textInput = await screen.findByPlaceholderText("Message");
      const sendButton = screen.getByRole("button", { name: "send message" });

      await userEvent.type(textInput, " ");
      await userEvent.click(sendButton);

      expect(mockAlert).toHaveBeenCalledExactlyOnceWith(
        "Cannot send an empty message",
      );
    });

    it("should render ErrorBoundary when server responds with unexpected error", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.post(serverMessagesRoute, {
        status: 500,
        body: {
          error: "Server error",
        },
      });
      renderUserChat();
      const textField = await screen.findByPlaceholderText("Message");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const sendButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(textField, "Hello!");
      await userEvent.upload(
        attachButton,
        new File(["hello"], "hello.png", { type: "image/png" }),
      );
      await userEvent.click(sendButton);
      const errorBoundaryHeading = screen.getByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorMessage = screen.getByText("Server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });

    it("should call 'enqueueSnackbar' on each client error", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<notistack.EnqueueSnackbar>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.post(serverMessagesRoute, {
        status: 404,
        body: {
          errors: [{ message: "Cannot find user to send message to." }],
        },
      });
      renderUserChat();
      const textField = await screen.findByPlaceholderText("Message");
      const sendButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(textField, "message");
      await userEvent.click(sendButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith(
        "Cannot find user to send message to.",
        { variant: "error" },
      );
    });

    it("should clear form fields after submit", async () => {
      expect.hasAssertions();

      fetchMock.post(serverMessagesRoute, {
        status: 201,
        body: {
          content: "Test-Message content",
          createdAt: new Date().toISOString(),
          groupChatId: null,
          id: "Test-MessageId",
          imageUrl: null,
          receiverId: "userBId",
          senderId: "userAId",
        } as Omit<Message, "createdAt"> & { createdAt: string },
      });
      renderUserChat();
      const textField =
        await screen.findByPlaceholderText<HTMLInputElement>("Message");
      const submitButton = screen.getByRole("button", { name: "send message" });

      await userEvent.type(textField, "message content");

      expect(textField).toHaveValue("message content");

      await userEvent.click(submitButton);

      expect(textField).not.toHaveValue();
    });
  });
});

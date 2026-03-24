import { createRoutesStub } from "react-router";
import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import {
  fireEvent,
  screen,
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
import type { ChatData, Messages, User } from "@/types/modelsType";

const getUserServerRoute = `${serverUrl}/auth/get-user`;
const addFriendServerRoute = `${serverUrl}/friendships`;

vi.mock(import("@/components/Chatting"), () => {
  return {
    default: ({ messages }: { messages: Messages }) => (
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
          friendRequestStatus: { type: "ACCEPTED", senderId: "userBId" },
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
          friendRequestStatus: { type: "ACCEPTED", senderId: "userBId" },
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
          friendRequestStatus: { type: "ACCEPTED", senderId: "userBId" },
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
          friendRequestStatus: { type: "PENDING", senderId: "userBId" },
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
          friendRequestStatus: { type: "PENDING", senderId: mockUser.id },
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
  });
});

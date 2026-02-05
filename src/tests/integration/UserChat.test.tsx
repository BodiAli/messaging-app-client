import { createRoutesStub } from "react-router";
import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import { badgeClasses } from "@mui/material";
import renderWithProviders from "@/utils/test-utils";
import UserChat from "@/components/UserChat";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import AppLayout from "@/app/AppLayout";
import type { ChatData, User } from "@/types/modelsType";

const getUserServerRoute = `${serverUrl}/auth/get-user`;

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
        children: [
          {
            path: "/friends/:userId",
            Component: () => <UserChat chatData={chatData} />,
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
                Component: () => <UserChat chatData={mockChatData} />,
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

  describe("messages data", () => {
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

  describe("adding a friend", () => {
    describe("given an unexpected error", () => {
      it.todo("should render ErrorBoundary");
    });
  });
});

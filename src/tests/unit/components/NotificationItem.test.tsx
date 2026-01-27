import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import NotificationItem from "@/components/NotificationItem";
import type { UserNotifications } from "@/types/userNotifications";

type Flatten<Type> = Type extends (infer Item)[] ? Item : Type;

const mockFriendRequest = {
  type: "FRIEND_REQUEST",
  id: "notificationId",
  createdAt: new Date("2020-02-01T22:30").toString(),
  groupChatInvitation: null,
  friendRequest: {
    createdAt: new Date().toISOString(),
    id: "friendRequestId",
    status: "PENDING",
    receiverId: "receiverId",
    sender: {
      id: "senderId",
      imageUrl: "imageUrl",
      username: "senderUsername",
    },
  },
} satisfies Flatten<UserNotifications["notifications"]>;

const mockGroupInvite = {
  type: "GROUP_INVITATION",
  id: "notificationId",
  friendRequest: null,
  createdAt: new Date("2020-01-01T01:00").toISOString(),
  groupChatInvitation: {
    name: "groupName",
    id: "groupId",
    createdAt: new Date().toISOString(),
    admin: {
      id: "adminId",
      imageUrl: null,
      username: "adminUsername",
    },
  },
} satisfies Flatten<UserNotifications["notifications"]>;

describe("notification-item component", () => {
  const onDeclineClickMock = vi.fn<(id: string) => () => void>();
  const onAcceptClickMock = vi.fn<(id: string) => () => void>();

  afterEach(() => {
    onDeclineClickMock.mockClear();
    onAcceptClickMock.mockClear();
  });

  describe("loading state", () => {
    describe("given isLoading prop to be true", () => {
      it("should render skeleton", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            isLoading
            notification={undefined}
            onDeclineClick={undefined}
            onAcceptClick={undefined}
          />,
        );

        const loadingSkeleton = screen.getAllByTestId("skeleton");

        expect(loadingSkeleton.length).toBeGreaterThan(0);
      });
    });

    describe("given isLoading prop to be false", () => {
      it("should render notification details", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            isLoading={false}
            notification={mockFriendRequest}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const loadingSkeleton = screen.queryAllByTestId("skeleton");
        const friendRequestMessage = screen.getByText(
          "senderUsername sent you a friend request",
        );

        expect(loadingSkeleton).toHaveLength(0);
        expect(friendRequestMessage).toBeInTheDocument();
      });
    });
  });

  describe("format createdAt", () => {
    describe("given ISO date string", () => {
      it("should render formatted createdAt date", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const notificationsDate = screen.getByRole("time");

        expect(notificationsDate).toHaveTextContent("Feb 1, 2020, 10:30 PM");
      });
    });
  });

  describe("group invitation notification", () => {
    describe("given group invitation", () => {
      it("should render a message indicating a group invite by admin", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const groupInviteMessage = screen.getByText(
          "adminUsername invited you to join groupName",
        );

        expect(groupInviteMessage).toBeInTheDocument();
      });
    });
  });

  describe("friend request notification", () => {
    describe("given friend request", () => {
      it("should render a message indicating a friend request with sender's username", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const friendRequestMessage = screen.getByText(
          "senderUsername sent you a friend request",
        );

        expect(friendRequestMessage).toBeInTheDocument();
      });
    });
  });

  describe("request sender's avatar", () => {
    describe("given no imageUrl", () => {
      it("should render default avatar", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const adminProfilePic = screen.getByTitle(
          "adminUsername no profile picture",
        );

        expect(adminProfilePic).toBeInTheDocument();
      });
    });

    describe("given present imageUrl", () => {
      it("should render avatar with expected alt text", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const senderProfilePic = screen.getByRole("img", {
          name: "senderUsername's profile picture",
        });

        expect(senderProfilePic).toBeInTheDocument();
      });
    });
  });

  describe("group invite buttons", () => {
    describe("given decline button", () => {
      it("should render a decline button", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Decline" });

        expect(declineButton).toBeInTheDocument();
      });

      it("should call onDeclineClick when decline button is clicked", async () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Decline" });
        await userEvent.click(declineButton);

        expect(onDeclineClickMock).toHaveBeenCalledExactlyOnceWith("groupId");
      });
    });

    describe("given accept button", () => {
      it("should render an accept button", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const acceptButton = screen.getByRole("button", { name: "Accept" });

        expect(acceptButton).toBeInTheDocument();
      });

      it("should onAcceptClick when accept button is clicked", async () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockGroupInvite}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Accept" });
        await userEvent.click(declineButton);

        expect(onDeclineClickMock).toHaveBeenCalledExactlyOnceWith("groupId");
      });
    });
  });

  describe("friend request buttons", () => {
    describe("given decline button", () => {
      it("should render a decline button", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Decline" });

        expect(declineButton).toBeInTheDocument();
      });

      it("should call onDeclineClick when decline button is clicked", async () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Decline" });
        await userEvent.click(declineButton);

        expect(onDeclineClickMock).toHaveBeenCalledExactlyOnceWith(
          "friendRequestId",
        );
      });
    });

    describe("given accept button", () => {
      it("should render an accept button", () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const acceptButton = screen.getByRole("button", { name: "Accept" });

        expect(acceptButton).toBeInTheDocument();
      });

      it("should onAcceptClick when accept button is clicked", async () => {
        expect.hasAssertions();

        render(
          <NotificationItem
            notification={mockFriendRequest}
            isLoading={false}
            onDeclineClick={onDeclineClickMock}
            onAcceptClick={onAcceptClickMock}
          />,
        );

        const declineButton = screen.getByRole("button", { name: "Accept" });
        await userEvent.click(declineButton);

        expect(onDeclineClickMock).toHaveBeenCalledExactlyOnceWith(
          "friendRequestId",
        );
      });
    });
  });
});

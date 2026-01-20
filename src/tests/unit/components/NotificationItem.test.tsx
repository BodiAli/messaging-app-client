import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
  describe("format createdAt", () => {
    describe("given ISO date string", () => {
      it("should render formatted createdAt date", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockFriendRequest} />);

        const notificationsDate = screen.getByRole("time");

        expect(notificationsDate).toHaveTextContent("Feb 1, 2020, 10:30 PM");
      });
    });
  });

  describe("group invitation notification", () => {
    describe("given group invitation", () => {
      it("should render a message indicating a group invite by admin", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockGroupInvite} />);

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

        render(<NotificationItem notification={mockFriendRequest} />);

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

        render(<NotificationItem notification={mockGroupInvite} />);

        const adminProfilePic = screen.getByTitle(
          "adminUsername no profile picture",
        );

        expect(adminProfilePic).toBeInTheDocument();
      });
    });

    describe("given present imageUrl", () => {
      it("should render avatar with expected alt text", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockFriendRequest} />);

        const senderProfilePic = screen.getByRole("img", {
          name: "senderUsername's profile picture",
        });

        expect(senderProfilePic).toBeInTheDocument();
      });
    });
  });

  describe("group invite buttons", () => {
    describe("given group invitation menu item", () => {
      it("should render a decline button", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockGroupInvite} />);

        const declineButton = screen.getByRole("button", { name: "Decline" });

        expect(declineButton).toBeInTheDocument();
      });

      it("should render an accept button", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockGroupInvite} />);

        const acceptButton = screen.getByRole("button", { name: "Accept" });

        expect(acceptButton).toBeInTheDocument();
      });
    });
  });

  describe("friend request buttons", () => {
    describe("given friend request menu item", () => {
      it("should render a decline button", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockFriendRequest} />);

        const declineButton = screen.getByRole("button", { name: "Decline" });

        expect(declineButton).toBeInTheDocument();
      });

      it("should render an accept button", () => {
        expect.hasAssertions();

        render(<NotificationItem notification={mockFriendRequest} />);

        const acceptButton = screen.getByRole("button", { name: "Accept" });

        expect(acceptButton).toBeInTheDocument();
      });
    });
  });
});

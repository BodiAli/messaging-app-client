import { screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import renderWithProviders from "@/utils/test-utils";
import Notifications from "@/components/Notifications";
import serverUrl from "@/utils/serverUrl";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { UserNotifications } from "@/types/userNotifications";

const notificationsRoute = `${serverUrl}/notifications/me`;
const respondToGroupInviteRoute = `${serverUrl}/users/me/groups/groupId/notifications`;
const respondToFriendRequestRoute = `${serverUrl}/friendships/friendRequestId`;

function assertIsElement(val: unknown): asserts val is Element {
  if (!(val instanceof Element)) throw new Error("Not an element");
}

const mockUserNotifications = {
  notifications: [
    {
      type: "GROUP_INVITATION",
      friendRequest: null,
      createdAt: new Date("2020-01-01T01:00").toString(),
      id: "notification1Id",
      groupChatInvitation: {
        createdAt: new Date().toDateString(),
        id: "groupId",
        name: "groupName",
        admin: {
          id: "adminId",
          imageUrl: "imageUrl",
          username: "adminUsername",
        },
      },
    },
    {
      type: "FRIEND_REQUEST",
      groupChatInvitation: null,
      createdAt: new Date("2020-02-01T22:30").toString(),
      id: "notification2Id",
      friendRequest: {
        createdAt: new Date().toDateString(),
        id: "friendRequestId",
        status: "PENDING",
        receiverId: "receiverId",
        sender: {
          id: "senderId",
          imageUrl: null,
          username: "senderUsername",
        },
      },
    },
  ],
} satisfies UserNotifications;

describe("notifications component", () => {
  const onClose = vi.fn<() => void>();
  const anchorElement = document.createElement("button");

  function renderNotificationsComponent() {
    return renderWithProviders(
      <Notifications
        open={true}
        onClose={onClose}
        anchorElement={anchorElement}
      />,
    );
  }

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render Menu when open is true", () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderWithProviders(
      <Notifications open anchorElement={anchorElement} onClose={onClose} />,
    );

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();
  });

  it("should not render Menu when open is false", () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderWithProviders(
      <Notifications
        open={false}
        anchorElement={anchorElement}
        onClose={onClose}
      />,
    );

    const menu = screen.queryByRole("menu");

    expect(menu).not.toBeInTheDocument();
  });

  it("should call onClose function when clicking away", async () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderWithProviders(
      <Notifications
        open={true}
        anchorElement={anchorElement}
        onClose={onClose}
      />,
    );

    const menuBackdrop = (await screen.findByRole("presentation")).firstChild;
    assertIsElement(menuBackdrop);
    await userEvent.click(menuBackdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should render two skeletons component when data is loading", () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderNotificationsComponent();

    const menuItems = screen.getAllByRole("menuitem");
    assertIsElement(menuItems[0]);
    assertIsElement(menuItems[1]);

    const skeleton1 = within(menuItems[0]).queryAllByTestId("skeleton");
    const skeleton2 = within(menuItems[1]).queryAllByTestId("skeleton");

    expect(menuItems.length).toBeGreaterThan(0);
    expect(skeleton1.length).toBeGreaterThan(0);
    expect(skeleton2.length).toBeGreaterThan(0);
  });

  it("should throw error when an unexpected error occurs", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);
    fetchMock.get(notificationsRoute, {
      status: 500,
      body: {
        error: "Server error",
      },
    });

    const router = createMemoryRouter([
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            path: "/",
            element: (
              <Notifications
                onClose={onClose}
                open
                anchorElement={anchorElement}
              />
            ),
          },
        ],
      },
    ]);
    renderWithProviders(<RouterProvider router={router} />);

    const errorMessage = await screen.findByText("Server error");

    expect(errorMessage).toBeInTheDocument();
  });

  it("should render 'No current notifications' when data length is 0", async () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderNotificationsComponent();

    const emptyText = await screen.findByText("No current notifications");

    expect(emptyText).toBeInTheDocument();
  });

  it("should render user notifications", async () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: mockUserNotifications,
    });
    renderNotificationsComponent();

    const notifications = await screen.findAllByRole("menuitem");

    expect(notifications).toHaveLength(2);
  });

  describe("accepting or rejecting a group invite", () => {
    describe("given declining a group invite", () => {
      it("should throw an error when an unexpected error occurs when rejecting an invite", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.get(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[0]],
          },
        });
        fetchMock.delete(respondToGroupInviteRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        const router = createMemoryRouter([
          {
            ErrorBoundary: ErrorBoundary,
            children: [
              {
                path: "/",
                element: (
                  <Notifications
                    open={true}
                    onClose={onClose}
                    anchorElement={anchorElement}
                  />
                ),
              },
            ],
          },
        ]);
        renderWithProviders(<RouterProvider router={router} />);
        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);
        const errorBoundaryHeading = screen.getByRole("heading", {
          level: 1,
          name: "Unexpected error occurred",
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });

      it("should decline group invite", async () => {
        expect.hasAssertions();

        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: mockUserNotifications,
        });
        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[1]],
          },
        });
        fetchMock.delete(respondToGroupInviteRoute, {
          status: 204,
        });
        renderNotificationsComponent();

        const notifications = await screen.findAllByRole("menuitem", {
          name: /Accept Decline/,
        });
        assertIsElement(notifications[0]);
        const declineButton = within(notifications[0]).getByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);
        const updatedNotifications = screen.getAllByRole("menuitem", {
          name: /Accept Decline/,
        });

        expect(notifications).toHaveLength(2);
        expect(updatedNotifications).toHaveLength(1);
        expect(fetchMock).toHaveDeleted(respondToGroupInviteRoute);
        expect(fetchMock).toHaveGotTimes(2, notificationsRoute);
      });
    });

    describe("given accepting a group invite", () => {
      it("should throw an error when an unexpected error occurs when accepting an invite", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.get(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[0]],
          },
        });
        fetchMock.patch(respondToGroupInviteRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        const router = createMemoryRouter([
          {
            ErrorBoundary: ErrorBoundary,
            children: [
              {
                path: "/",
                element: (
                  <Notifications
                    open={true}
                    onClose={onClose}
                    anchorElement={anchorElement}
                  />
                ),
              },
            ],
          },
        ]);
        renderWithProviders(<RouterProvider router={router} />);
        const declineButton = await screen.findByRole("button", {
          name: "Accept",
        });

        await userEvent.click(declineButton);
        const errorBoundaryHeading = screen.getByRole("heading", {
          level: 1,
          name: "Unexpected error occurred",
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });

      it("should accept group invite", async () => {
        expect.hasAssertions();

        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: mockUserNotifications,
        });
        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[1]],
          },
        });
        fetchMock.patch(respondToGroupInviteRoute, {
          status: 204,
        });
        renderNotificationsComponent();

        const notifications = await screen.findAllByRole("menuitem", {
          name: /Accept Decline/,
        });
        assertIsElement(notifications[0]);
        const acceptButton = within(notifications[0]).getByRole("button", {
          name: "Accept",
        });
        await userEvent.click(acceptButton);
        const updatedNotifications = screen.getAllByRole("menuitem", {
          name: /Accept Decline/,
        });

        expect(notifications).toHaveLength(2);
        expect(updatedNotifications).toHaveLength(1);
        expect(fetchMock).toHavePatched(respondToGroupInviteRoute);
        expect(fetchMock).toHaveGotTimes(2, notificationsRoute);
      });
    });
  });

  describe("accepting or rejecting a friend request", () => {
    describe("given declining a friend request", () => {
      it("should throw an error when an unexpected error occurs when declining a request", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.get(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[1]],
          },
        });
        fetchMock.delete(respondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        const router = createMemoryRouter([
          {
            ErrorBoundary,
            children: [
              {
                path: "/",
                element: (
                  <Notifications
                    open
                    onClose={onClose}
                    anchorElement={anchorElement}
                  />
                ),
              },
            ],
          },
        ]);
        renderWithProviders(<RouterProvider router={router} />);
        const declineButton = await screen.findByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);
        const errorBoundaryHeading = screen.getByRole("heading", {
          level: 1,
          name: "Unexpected error occurred",
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });

      it("should decline friend request", async () => {
        expect.hasAssertions();

        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: mockUserNotifications,
        });
        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[0]],
          },
        });
        fetchMock.delete(respondToFriendRequestRoute, {
          status: 204,
        });
        renderNotificationsComponent();
        const notifications = await screen.findAllByRole("menuitem", {
          name: /Accept Decline/,
        });
        assertIsElement(notifications[1]);
        const declineButton = within(notifications[1]).getByRole("button", {
          name: "Decline",
        });

        await userEvent.click(declineButton);
        const updatedNotifications = screen.getAllByRole("menuitem", {
          name: /Accept Decline/,
        });

        expect(notifications).toHaveLength(2);
        expect(updatedNotifications).toHaveLength(1);
        expect(fetchMock).toHaveGotTimes(2, notificationsRoute);
        expect(fetchMock).toHaveDeleted(respondToFriendRequestRoute);
      });
    });

    describe("given accepting a friend request", () => {
      it("should throw an error when an unexpected error occurs when accepting a request", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.get(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[1]],
          },
        });
        fetchMock.patch(respondToFriendRequestRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        const router = createMemoryRouter([
          {
            ErrorBoundary,
            children: [
              {
                path: "/",
                element: (
                  <Notifications
                    open
                    onClose={onClose}
                    anchorElement={anchorElement}
                  />
                ),
              },
            ],
          },
        ]);
        renderWithProviders(<RouterProvider router={router} />);
        const acceptButton = await screen.findByRole("button", {
          name: "Accept",
        });

        await userEvent.click(acceptButton);
        const errorBoundaryHeading = screen.getByRole("heading", {
          level: 1,
          name: "Unexpected error occurred",
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });

      it("should accept friend request", async () => {
        expect.hasAssertions();

        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: mockUserNotifications,
        });
        fetchMock.getOnce(notificationsRoute, {
          status: 200,
          body: {
            notifications: [mockUserNotifications.notifications[0]],
          },
        });
        fetchMock.patch(respondToFriendRequestRoute, {
          status: 204,
        });
        renderNotificationsComponent();
        const notifications = await screen.findAllByRole("menuitem", {
          name: /Accept Decline/,
        });
        assertIsElement(notifications[1]);
        const acceptButton = within(notifications[1]).getByRole("button", {
          name: "Accept",
        });

        await userEvent.click(acceptButton);
        const updatedNotifications = screen.getAllByRole("menuitem", {
          name: /Accept Decline/,
        });

        expect(notifications).toHaveLength(2);
        expect(updatedNotifications).toHaveLength(1);
        expect(fetchMock).toHaveGotTimes(2, notificationsRoute);
        expect(fetchMock).toHavePatched(respondToFriendRequestRoute);
      });
    });
  });
});

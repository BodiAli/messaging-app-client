import { screen, waitForElementToBeRemoved } from "@testing-library/react";
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

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <p>Main Layout</p>,
  };
});

function assertIsElement(val: unknown): asserts val is Element {
  if (!(val instanceof Element)) throw new Error("Not an element");
}

const userNotifications = {
  notifications: [
    {
      type: "GROUP_INVITATION",
      friendRequest: null,
      createdAt: new Date("2020-01-01T01:00").toString(),
      id: "notification1Id",
      groupChatInvitation: {
        createdAt: new Date().toDateString(),
        id: "groupInvitationId",
        name: "groupName",
        admin: {
          id: "adminId",
          imageUrl: null,
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

  it("should render Menu when open is true", async () => {
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

    const menu = await screen.findByRole("menu");

    expect(menu).toBeInTheDocument();
  });

  it("should not render Menu when open is false", async () => {
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

    await waitForElementToBeRemoved(screen.getByTestId("loader"));
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

  it("should render Loader component when data is loading", () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderNotificationsComponent();

    const loader = screen.getByTestId("loader");

    expect(loader).toBeVisible();
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
      body: userNotifications,
    });
    renderNotificationsComponent();

    const notifications = await screen.findAllByRole("menuitem");

    expect(notifications).toHaveLength(2);
  });

  it("should render notification createdAt date", async () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: userNotifications,
    });
    renderNotificationsComponent();

    const notificationsDate = await screen.findAllByRole("time");

    expect(notificationsDate[0]).toHaveTextContent("Jan 1, 2020, 01:00 AM");
    expect(notificationsDate[1]).toHaveTextContent("Feb 1, 2020, 10:30 PM");
  });
});

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useParams,
} from "react-router";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import routes from "@/routes/routes";
import serverUrl from "@/utils/serverUrl";
import type { NonFriends } from "@/types/modelsType";

vi.mock(import("@/app/AppLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/app/ProtectedRoute"), () => {
  return {
    default: ({ children }) => children,
  };
});

vi.mock(import("@/pages/TwoUsersChatPage"), () => {
  return {
    default: function TwoUsersChatPage() {
      const { userId } = useParams<{ userId: string }>();

      return <p>Mock: {userId} chat page</p>;
    },
  };
});

describe("non-friends-page component", () => {
  const serverGetNonFriendsRoute = `${serverUrl}/users/me/anonymous`;

  const mockNonFriends: NonFriends = {
    nonFriends: [
      {
        id: "Test-UserA-Id",
        imageUrl: "Test-UserA-Image-Url",
        username: "Test: userA username",
      },
      {
        id: "Test-UserB-Id",
        imageUrl: null,
        username: "Test: userB username",
      },
    ],
  };

  const renderNonFriends = () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/non-friends"],
    });
    return renderWithProviders(<RouterProvider router={router} />);
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering heading", () => {
    it("should render heading with 'Non-friends' text", () => {
      expect.hasAssertions();

      renderNonFriends();

      const heading = screen.getByRole("heading", {
        name: "Non-friends",
        level: 2,
      });

      expect(heading).toBeInTheDocument();
    });
  });

  describe("rendering loading skeleton while GET request is pending", () => {
    it("should render a skeleton while request is pending", async () => {
      expect.hasAssertions();

      const { promise, resolve } = Promise.withResolvers();
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        await promise;

        return new Response(JSON.stringify(mockNonFriends), { status: 200 });
      });
      renderNonFriends();

      const skeleton = screen.getByTestId("skeleton");

      expect(skeleton).toBeInTheDocument();

      resolve(null);
      await waitForElementToBeRemoved(skeleton);

      expect(skeleton).not.toBeInTheDocument();
    });
  });

  describe("handling error response for GET request to get user's non-friends", () => {
    it("should render ErrorBoundary when server responds with 500 status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGetNonFriendsRoute, {
        status: 500,
        body: {
          error: "Test: server error",
        },
      });
      renderNonFriends();

      const errorBoundaryHeading = await screen.findByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Test: server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });
  });

  describe("handling success response for GET request to get user's non-friends", () => {
    it("should render non-friends profile picture", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGetNonFriendsRoute, {
        status: 200,
        body: mockNonFriends,
      });
      renderNonFriends();

      const userAProfilePicture = await screen.findByRole("img", {
        name: "Test: userA username's profile picture",
      });
      const userBProfilePicture = screen.getByTitle(
        "Test: userB username no profile picture",
      );

      expect(userAProfilePicture).toBeInTheDocument();
      expect(userBProfilePicture).toBeInTheDocument();
    });

    it("should render non-friends username", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGetNonFriendsRoute, {
        status: 200,
        body: mockNonFriends,
      });
      renderNonFriends();

      const userAUsername = await screen.findByText("Test: userA username");
      const userBUsername = await screen.findByText("Test: userB username");

      expect(userAUsername).toBeInTheDocument();
      expect(userBUsername).toBeInTheDocument();
    });

    it("should render each non-friend as an anchor element", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGetNonFriendsRoute, {
        status: 200,
        body: mockNonFriends,
      });
      renderNonFriends();

      const userALink = await screen.findByRole<HTMLAnchorElement>("link", {
        name: "Chat with Test: userA username",
      });
      const userBLink = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Chat with Test: userB username",
      });

      expect(userALink).toBeInstanceOf(HTMLAnchorElement);
      expect(userBLink).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe("navigating to a non-friend chat", () => {
    it("should navigate to each non friend chat when its link is clicked", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGetNonFriendsRoute, {
        status: 200,
        body: mockNonFriends,
      });
      renderNonFriends();
      const userALink = await screen.findByRole<HTMLAnchorElement>("link", {
        name: "Chat with Test: userA username",
      });
      const userBLink = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Chat with Test: userB username",
      });

      await userEvent.click(userALink);
      const userAChatPage = screen.getByText("Mock: Test-UserA-Id chat page");
      await userEvent.click(userBLink);
      const userBChatPage = screen.getByText("Mock: Test-UserB-Id chat page");

      expect(userAChatPage).toBeInTheDocument();
      expect(userBChatPage).toBeInTheDocument();
    });
  });
});

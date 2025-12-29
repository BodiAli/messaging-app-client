import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, useParams } from "react-router";
import { describe, it, beforeAll, afterEach, expect, beforeEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { User, UserFriends } from "@/types/modelsType";

vi.mock(import("@/pages/LoginPage"), () => {
  return {
    default: () => <h1>Log in page</h1>,
  };
});

vi.mock(import("@/pages/MessageFriend"), () => {
  return {
    default: function MessageFriend() {
      const { friendId } = useParams<{ friendId: string }>();

      return <p>{friendId}</p>;
    },
  };
});

const getUserServerRoute = `${serverUrl}/auth/get-user`;
const getFriendsServerRoute = `${serverUrl}/users/me/friends`;

const mockedUser: User = {
  id: "userId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "username",
};

const mockedUserFriends: UserFriends = {
  friends: [
    {
      id: "idFriend1",
      username: "usernameFriend1",
      imageUrl: "imageUrl",
      lastSeen: new Date().toISOString(),
    },
    {
      id: "idFriend2",
      username: "usernameFriend2",
      imageUrl: "imageUrl",
      lastSeen: new Date().toISOString(),
    },
  ],
};

describe("friends-page component", () => {
  const renderFriendsPath = () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/friends"] });
    return renderWithProviders(<RouterProvider router={router} />);
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockImplementation(
      () => "jwtToken",
    );

    fetchMock.get(getUserServerRoute, {
      status: 200,
      body: { user: mockedUser, token: "jwtToken" },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render 'Your friends' heading", async () => {
    expect.hasAssertions();

    fetchMock.get(getFriendsServerRoute, {
      status: 200,
      body: mockedUserFriends,
    });
    renderFriendsPath();

    const heading = await screen.findByRole("heading", {
      name: "Your friends",
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });

  it("should render ErrorBoundary if server does not respond with 2xx status", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);
    fetchMock.get(getFriendsServerRoute, {
      status: 500,
      body: {
        error: "Server error!",
      },
    });
    renderFriendsPath();

    const errorBoundaryHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Unexpected error occurred",
    });
    const errorMessage = screen.getByText("Server error!");

    expect(errorBoundaryHeading).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it("should navigate to homepage if token expires", async () => {
    expect.hasAssertions();

    fetchMock.get(getFriendsServerRoute, {
      status: 401,
      body: "Unauthorized",
    });
    renderFriendsPath();

    const logInPageHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Log in page",
    });

    expect(logInPageHeading).toBeInTheDocument();
  });

  it("should navigate to the corresponding friend page when friend link is clicked", async () => {
    expect.hasAssertions();

    fetchMock.get(getFriendsServerRoute, {
      status: 200,
      body: mockedUserFriends,
    });
    renderFriendsPath();

    const friendsLinks = await screen.findAllByRole("link", {
      name: /friend$/,
    });

    for (const friendLink of friendsLinks) {
      await userEvent.click(friendLink);
      const friendChatText = screen.getByText(/idFriend[1-2]/);

      expect(friendChatText).toBeInTheDocument();
    }

    expect(friendsLinks).toHaveLength(2);
  });

  it.todo("should render friends username, imageUrl, and lastSeen");
});

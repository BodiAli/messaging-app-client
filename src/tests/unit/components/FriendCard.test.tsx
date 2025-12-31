import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import FriendCard from "@/components/FriendCard";
import type { Friend } from "@/types/modelsType";

const renderWithRouterProvider = (mockFriend: Friend) => {
  const router = createMemoryRouter([
    {
      element: <FriendCard friend={mockFriend} />,
      path: "/",
    },
  ]);

  return render(<RouterProvider router={router} />);
};

describe("friend-card component", () => {
  it("should render anchor tag with href to be friend id", () => {
    expect.hasAssertions();

    const mockFriend: Friend = {
      id: "mockId",
      imageUrl: null,
      lastSeen: "2020-01-01T01:30:30Z",
      username: "mockUsername",
    };

    renderWithRouterProvider(mockFriend);

    const linkTag = screen.getByRole<HTMLAnchorElement>("link", {
      name: "mockUsername friend",
    });

    expect(linkTag.pathname).toBe("/mockId");
  });

  it("should render imageUrl as profile pic when imageUrl is provided", () => {
    expect.hasAssertions();

    const mockFriend: Friend = {
      id: "mockId",
      imageUrl: "imageUrl",
      lastSeen: "2020-01-01T01:30:30Z",
      username: "mockUsername",
    };
    renderWithRouterProvider(mockFriend);

    const profilePic = screen.getByRole("img", {
      name: "mockUsername's profile picture",
    });

    expect(profilePic).toBeInTheDocument();
  });

  it("should render default profile pic when imageUrl is null", () => {
    expect.hasAssertions();

    const mockFriend: Friend = {
      id: "mockId",
      imageUrl: null,
      lastSeen: "2020-01-01T01:30:30Z",
      username: "mockUsername",
    };
    renderWithRouterProvider(mockFriend);

    const genericProfilePic = screen.getByTitle(
      "usernameFriend2's no profile picture",
    );

    expect(genericProfilePic).toBeInTheDocument();
  });

  it("should render friend username", () => {
    expect.hasAssertions();

    const mockFriend: Friend = {
      id: "mockId",
      imageUrl: null,
      lastSeen: "2020-01-01T01:30:30Z",
      username: "mockUsername",
    };
    renderWithRouterProvider(mockFriend);

    const username = screen.getByText("mockUsername");

    expect(username).toBeInTheDocument();
  });

  it("should render friend as online 5 minutes or less have passed since lastSeen", () => {
    expect.hasAssertions();

    const mockFriend: Friend = {
      id: "mockId",
      imageUrl: null,
      lastSeen: "2020-01-01T01:30:00Z",
      username: "mockUsername",
    };
    renderWithRouterProvider(mockFriend);

    const onlineBadge = screen.getByTestId("online-badge");

    expect(onlineBadge).toBeVisible();
  });
});

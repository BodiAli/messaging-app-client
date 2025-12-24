import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";

vi.mock(import("@/app/AppLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/app/ProtectedRoute"), () => {
  return {
    default: ({ children }) => <>{children}</>,
  };
});

vi.mock(import("@/pages/FriendsPage"), () => {
  return {
    default: () => <h1>Friends page</h1>,
  };
});

vi.mock(import("@/pages/GroupsPage"), () => {
  return {
    default: () => <h1>Groups page</h1>,
  };
});

vi.mock(import("@/pages/NonFriendsPage"), () => {
  return {
    default: () => <h1>Non friends page</h1>,
  };
});

vi.mock(import("@/pages/ProfilePage"), () => {
  return {
    default: () => <h1>Profile page</h1>,
  };
});

describe("navigation-sidebar component", () => {
  const renderWithRouter = () => {
    const router = createMemoryRouter(routes);

    return render(<RouterProvider router={router} />);
  };

  describe("nav element", () => {
    it("should render nav element", () => {
      expect.hasAssertions();

      renderWithRouter();

      const navElement = screen.getByRole("navigation");

      expect(navElement).toBeInTheDocument();
    });
  });

  describe("friends icon link", () => {
    it("should render friends icon link", () => {
      expect.hasAssertions();

      renderWithRouter();

      const navElement = screen.getByRole("navigation");
      const friendsLinkElement = within(navElement).getByRole("link", {
        name: "Friends",
      });
      const friendsIcon = screen.getByTestId("PeopleIcon");

      expect(friendsLinkElement).toBeInTheDocument();
      expect(friendsIcon).toBeInTheDocument();
    });

    it("should navigate to '/friends' path when the friends link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();

      const friendsLinkElement = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Friends",
      });

      await userEvent.click(friendsLinkElement);

      expect(friendsLinkElement.pathname).toBe("/friends");
      expect(
        screen.getByRole("heading", { name: "Friends page", level: 1 }),
      ).toBeInTheDocument();
    });
  });

  describe("groups icon link", () => {
    it("should render groups icon link", () => {
      expect.hasAssertions();

      renderWithRouter();

      const navElement = screen.getByRole("navigation");
      const groupsLinkElement = within(navElement).getByRole("link", {
        name: "Groups",
      });
      const groupsIcon = screen.getByTestId("GroupsIcon");

      expect(groupsLinkElement).toBeInTheDocument();
      expect(groupsIcon).toBeInTheDocument();
    });

    it("should navigate to '/groups' path when groups link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const groupsLinkElement = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Groups",
      });
      await userEvent.click(groupsLinkElement);

      expect(groupsLinkElement.pathname).toBe("/groups");
      expect(
        screen.getByRole("heading", { name: "Groups page", level: 1 }),
      ).toBeInTheDocument();
    });
  });

  describe("non-friends icon link", () => {
    it("should render non-friend icon link", () => {
      expect.hasAssertions();

      renderWithRouter();
      const navElement = screen.getByRole("navigation");
      const nonFriendsLinkElement = within(navElement).getByRole("link", {
        name: "Non friends",
      });
      const nonFriendsIcon = screen.getByTestId("PermIdentityIcon");

      expect(nonFriendsLinkElement).toBeInTheDocument();
      expect(nonFriendsIcon).toBeInTheDocument();
    });

    it("should navigate to '/non-friends' path when non-friends link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const nonFriendsLinkElement = screen.getByRole<HTMLAnchorElement>(
        "link",
        {
          name: "Non friends",
        },
      );
      await userEvent.click(nonFriendsLinkElement);

      expect(nonFriendsLinkElement.pathname).toBe("/non-friends");
      expect(
        screen.getByRole("heading", { level: 1, name: "Non friends page" }),
      ).toBeInTheDocument();
    });
  });

  describe("profile icon link", () => {
    it("should render profile icon link", () => {
      expect.hasAssertions();

      renderWithRouter();
      const navElement = screen.getByRole("navigation");
      const profileLinkElement = within(navElement).getByRole("link", {
        name: "Profile",
      });
      const profileIcon = screen.getByTestId("AccountBoxIcon");

      expect(profileLinkElement).toBeInTheDocument();
      expect(profileIcon).toBeInTheDocument();
    });

    it("should navigate to '/profile' path when profile link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const profileLinkElement = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Profile",
      });

      await userEvent.click(profileLinkElement);

      expect(profileLinkElement.pathname).toBe("/profile");
      expect(
        screen.getByRole("heading", { level: 1, name: "Profile page" }),
      ).toBeInTheDocument();
    });
  });
});

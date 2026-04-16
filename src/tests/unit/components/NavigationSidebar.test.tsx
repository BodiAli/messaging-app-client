import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, assert } from "vitest";
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

vi.mock(import("@/pages/IndexPage"), () => {
  return {
    default: () => <h1>Welcome user</h1>,
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
      const friendsIcon = within(navElement).getByTestId("PeopleIcon");

      expect(friendsLinkElement).toBeInTheDocument();
      expect(friendsIcon).toBeInTheDocument();
    });

    it("should navigate to '/friends' path when the friends link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();

      const friendsLinkElement = screen.getAllByRole<HTMLAnchorElement>(
        "link",
        {
          name: "Friends",
        },
      )[0];
      assert(friendsLinkElement);

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
      const groupsIcon = within(navElement).getByTestId("GroupsIcon");

      expect(groupsLinkElement).toBeInTheDocument();
      expect(groupsIcon).toBeInTheDocument();
    });

    it("should navigate to '/groups' path when groups link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const groupsLinkElement = screen.getAllByRole<HTMLAnchorElement>("link", {
        name: "Groups",
      })[0];
      assert(groupsLinkElement);
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
      const nonFriendsIcon = within(navElement).getByTestId("PermIdentityIcon");

      expect(nonFriendsLinkElement).toBeInTheDocument();
      expect(nonFriendsIcon).toBeInTheDocument();
    });

    it("should navigate to '/non-friends' path when non-friends link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const nonFriendsLinkElement = screen.getAllByRole<HTMLAnchorElement>(
        "link",
        {
          name: "Non friends",
        },
      )[0];
      assert(nonFriendsLinkElement);
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
      const profileIcon = within(navElement).getByTestId("AccountBoxIcon");

      expect(profileLinkElement).toBeInTheDocument();
      expect(profileIcon).toBeInTheDocument();
    });

    it("should navigate to '/profile' path when profile link is clicked", async () => {
      expect.hasAssertions();

      renderWithRouter();
      const profileLinkElement = screen.getAllByRole<HTMLAnchorElement>(
        "link",
        {
          name: "Profile",
        },
      )[0];
      assert(profileLinkElement);

      await userEvent.click(profileLinkElement);

      expect(profileLinkElement.pathname).toBe("/profile");
      expect(
        screen.getByRole("heading", { level: 1, name: "Profile page" }),
      ).toBeInTheDocument();
    });
  });
});

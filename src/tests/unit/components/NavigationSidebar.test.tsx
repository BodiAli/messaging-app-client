import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import NavigationSidebar from "@/components/NavigationSidebar";

describe("navigation-sidebar component", () => {
  const renderWithRouter = () => {
    const router = createMemoryRouter([
      {
        path: "/",
        Component: NavigationSidebar,
      },
      {
        path: "/friends",
        Component: () => <h1>Friends page</h1>,
      },
      {
        path: "/anonymous",
        Component: () => <h1>Anonymous page</h1>,
      },
      {
        path: "/find-friends",
        Component: () => <h1>Find friends page</h1>,
      },
      {
        path: "/profile",
        Component: () => <h1>Profile page</h1>,
      },
    ]);

    return render(<RouterProvider router={router} />);
  };

  it("should render nav element", () => {
    expect.hasAssertions();

    renderWithRouter();

    const navElement = screen.getByRole("navigation");

    expect(navElement).toBeInTheDocument();
  });

  describe("friends icon link", () => {
    it("should render a friends icon link", () => {
      expect.hasAssertions();

      renderWithRouter();

      const navElement = screen.getByRole("navigation");
      const friendsLinkElement = within(navElement).getByRole("link", {
        name: "Friends",
      });
      const friendsIcons = screen.getByTestId("PeopleIcon");

      expect(friendsLinkElement).toBeInTheDocument();
      expect(friendsIcons).toBeInTheDocument();
    });

    it("should navigate to '/friends' path when the friends icon link is clicked", async () => {
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
});

import { describe, it, expect } from "vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import routes from "@/routes/routes";

vi.mock(import("@/app/AppLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/pages/GroupsPage"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/app/ProtectedRoute"), () => {
  return {
    default: ({ children }) => children,
  };
});

vi.mock(import("@/pages/CreateGroupPage"), () => {
  return {
    default: () => <p>create group</p>,
  };
});

describe("groups-page-index component", () => {
  describe("rendering link to creating new group page", () => {
    it("should render a link with 'Create new group' text", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      render(<RouterProvider router={router} />);

      const createGroupLink = screen.getByRole("link", {
        name: "Create new group",
      });

      expect(createGroupLink).toBeInTheDocument();
    });

    it("should navigate to '/groups/create-group'", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      render(<RouterProvider router={router} />);

      const createGroupLink = screen.getByRole<HTMLAnchorElement>("link", {
        name: "Create new group",
      });
      await userEvent.click(createGroupLink);
      const createGroupPageElement = screen.getByText("create group");

      expect(createGroupLink.pathname).toBe("/groups/create-group");
      expect(createGroupPageElement).toBeInTheDocument();
    });
  });
});

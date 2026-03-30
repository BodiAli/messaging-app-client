import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";

const serverCreateGroupRoute = "/users/me/groups";

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

describe("groups-page-index component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering heading", () => {
    it("should render a heading describing the component", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const headingElement = screen.getByRole("heading", {
        level: 1,
        name: "Create a new group",
      });

      expect(headingElement).toBeInTheDocument();
    });
  });

  describe("rendering form element", () => {
    it("should render a form element", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const formElement = screen.getByRole("form", {
        name: "create new group",
      });

      expect(formElement).toBeInTheDocument();
    });
  });

  describe("rendering form fields", () => {
    it("should render group name text input", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameInput = screen.getByRole("textbox", {
        name: "Group name",
      });

      expect(groupNameInput).toBeInTheDocument();
    });

    it("should render group name as required", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameInput = screen.getByRole<HTMLInputElement>("textbox", {
        name: "Group name",
      });

      expect(groupNameInput).toBeRequired();
    });

    it("should render a submit button", () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const submitButton = screen.getByRole<HTMLButtonElement>("button", {
        name: "Create group",
      });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton.type).toBe("submit");
    });
  });

  describe("validating form fields", () => {
    it("should render an error when submitting form with empty group name", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const groupNameInput = screen.getByRole("textbox", {
        name: "Group name",
      });
      const submitButton = screen.getByRole("button", {
        name: "Create group",
      });

      await userEvent.type(groupNameInput, " ");
      await userEvent.click(submitButton);
      const groupNameError = screen.getByText("Group name cannot be empty.");

      expect(groupNameError).toBeInTheDocument();
    });
  });

  describe("handling form submit errors", () => {
    it("should render 4xx error messages returned by the server as listitems", async () => {
      expect.hasAssertions();

      fetchMock.post(serverCreateGroupRoute, {
        status: 400,
        body: {
          errors: [{ message: "SERVER: Group cannot be empty" }],
        },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const groupNameInput = screen.getByRole("textbox", {
        name: "Group name",
      });
      const submitButton = screen.getByRole("button", {
        name: "Create group",
      });

      await userEvent.type(groupNameInput, "group name");
      await userEvent.click(submitButton);
      const errorsList = screen.getByRole("list");
      const errorsListitem = within(errorsList).getByRole("listitem");

      expect(errorsListitem).toHaveTextContent("SERVER: Group cannot be empty");
    });

    it.todo("should render ErrorBoundary when server responds with 5xx status");
  });
});

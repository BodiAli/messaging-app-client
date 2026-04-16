import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import * as notistack from "notistack";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { GroupChat, User } from "@/types/modelsType";

const serverCreateGroupRoute = `${serverUrl}/users/me/groups`;

vi.mock(import("@/components/Header"), () => {
  return {
    default: () => <p>Mock: header component</p>,
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

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("Mock-JWT");
    fetchMock.get(`${serverUrl}/auth/get-user`, {
      status: 200,
      body: {
        user: {
          id: "Test-UserA-Id",
          imageUrl: null,
          isGuest: false,
          lastSeen: new Date().toISOString(),
          username: "Test: userA username",
        },
      } satisfies { user: User },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering heading", () => {
    it("should render a heading describing the component", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const headingElement = await screen.findByRole("heading", {
        level: 1,
        name: "Create a new group",
      });

      expect(headingElement).toBeInTheDocument();
    });
  });

  describe("rendering form element", () => {
    it("should render a form element", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const formElement = await screen.findByRole("form", {
        name: "create new group",
      });

      expect(formElement).toBeInTheDocument();
    });
  });

  describe("rendering form fields", () => {
    it("should render group name text input", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameInput = await screen.findByRole("textbox", {
        name: "Group name",
      });

      expect(groupNameInput).toBeInTheDocument();
    });

    it("should render group name as required", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const groupNameInput = await screen.findByRole<HTMLInputElement>(
        "textbox",
        {
          name: "Group name",
        },
      );

      expect(groupNameInput).toBeRequired();
    });

    it("should render a submit button", async () => {
      expect.hasAssertions();

      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const submitButton = await screen.findByRole<HTMLButtonElement>(
        "button",
        {
          name: "Create group",
        },
      );

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
      const groupNameInput = await screen.findByRole("textbox", {
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
      const groupNameInput = await screen.findByRole("textbox", {
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

    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.post(serverCreateGroupRoute, {
        status: 500,
        body: {
          error: "Server Error!",
        },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const groupNameInput = await screen.findByRole("textbox", {
        name: "Group name",
      });
      const submitButton = screen.getByRole("button", {
        name: "Create group",
      });
      await userEvent.type(groupNameInput, "group name");
      await userEvent.click(submitButton);

      const errorBoundaryElement = screen.getByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Server Error!");

      expect(errorBoundaryElement).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });
  });

  describe("handling valid form submit", () => {
    it("should disable submit button while submitting", async () => {
      expect.hasAssertions();

      const { promise, resolve } = Promise.withResolvers();
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              user: {
                id: "Test-UserA-Id",
                imageUrl: null,
                isGuest: false,
                lastSeen: new Date().toISOString(),
                username: "Test: userA username",
              },
            }),
            { status: 200 },
          ),
        )
        .mockImplementationOnce(async () => {
          await promise;

          const groupResponse: { group: GroupChat } = {
            group: {
              adminId: "adminId",
              createdAt: "2020-01-01T01:30:00Z",
              id: "groupId",
              name: "group name",
            },
          };
          return new Response(JSON.stringify(groupResponse), {
            status: 201,
            headers: {
              "Content-type": "application/json",
            },
          });
        });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const groupNameInput = await screen.findByRole("textbox", {
        name: "Group name",
      });
      const submitButton = screen.getByRole("button", {
        name: "Create group",
      });

      await userEvent.type(groupNameInput, "group name");
      await userEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      resolve(null);
      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    it("should call enqueueSnackbar after submitting form", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockImplementation(() => {
        return {
          enqueueSnackbar: mockEnqueueSnackbar,
          closeSnackbar: vi.fn<() => void>(),
        };
      });
      fetchMock.post(serverCreateGroupRoute, {
        status: 201,
        body: {
          group: {
            adminId: "adminId",
            createdAt: "2020-01-01T01:30:00Z",
            id: "groupId",
            name: "group name",
          },
        } satisfies { group: GroupChat },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups"],
      });
      renderWithProviders(<RouterProvider router={router} />);
      const groupNameInput = await screen.findByRole("textbox", {
        name: "Group name",
      });
      const submitButton = screen.getByRole("button", {
        name: "Create group",
      });

      await userEvent.type(groupNameInput, "group name");
      await userEvent.click(submitButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("group name was created successfully", { variant: "success" });
    });
  });
});

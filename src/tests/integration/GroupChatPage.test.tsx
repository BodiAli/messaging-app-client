import { describe, it, vi, beforeAll, afterEach, expect } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import * as notistack from "notistack";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import type { ApiClientError } from "@/types/apiResponseTypes";

const serverGetGroupChat = "/users/me/groups/groupId/messages";

vi.mock(import("@/app/ProtectedRoute"), () => {
  return {
    default: ({ children }) => children,
  };
});

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

vi.mock(import("@/pages/GroupsPage"), () => {
  return {
    default: () => <Outlet />,
  };
});

describe("group-chat-page component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("handling fetch errors when requesting group messages", () => {
    it("should render ErrorBoundary when the server responds with a 500 status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGetGroupChat, {
        status: 500,
        body: {
          error: "Server error!",
        },
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/groupId"],
      });
      renderWithProviders(<RouterProvider router={router} />);

      const errorBoundaryHeading = await screen.findByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Server error!");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueue snackbar on 4xx errors and navigate to home page", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockImplementation(() => {
        return {
          enqueueSnackbar: mockEnqueueSnackbar,
          closeSnackbar: vi.fn<() => void>(),
        };
      });
      fetchMock.get(serverGetGroupChat, {
        status: 404,
        body: {
          errors: [{ message: "Group not found." }],
        } as ApiClientError,
      });
      const router = createMemoryRouter(routes, {
        initialEntries: ["/groups/groupId"],
      });

      renderWithProviders(<RouterProvider router={router} />);
      await waitForElementToBeRemoved(screen.getByTestId("loader"));

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Group not found.", { variant: "error" });
      expect(router.state.location.pathname).toBe("/");
    });
  });
});

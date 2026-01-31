import { describe, beforeAll, afterEach, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  createRoutesStub,
  RouterProvider,
} from "react-router";
import * as notistackLibrary from "notistack";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { screen, waitFor } from "@testing-library/react";
import serverUrl from "@/utils/serverUrl";
import ErrorBoundary from "@/components/ErrorBoundary";
import TwoUsersChatPage from "@/pages/TwoUsersChatPage";
import renderWithProviders from "@/utils/test-utils";
import type { Messages } from "@/types/modelsType";

const messagesRoute = `${serverUrl}/users/userId/messages`;

const mockEnqueueSnackbar = vi.fn<notistackLibrary.EnqueueSnackbar>();

const mockMessage: { messages: Messages } = {
  messages: [
    {
      content: "messageFromUserA",
      createdAt: new Date().toISOString(),
      groupChatId: null,
      id: "messageIdUserA",
      imageUrl: null,
      senderId: "userAId",
      receiverId: "userBId",
    },
    {
      content: "messageFromUserB",
      createdAt: new Date().toISOString(),
      groupChatId: null,
      id: "messageIdUserB",
      imageUrl: null,
      senderId: "userBId",
      receiverId: "userAId",
    },
  ],
};

describe("two-users-chat-page component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetching user messages", () => {
    describe("given an unexpected error", () => {
      it("should render ErrorBoundary with error message", async () => {
        expect.hasAssertions();

        vi.spyOn(console, "error").mockImplementation(() => null);
        fetchMock.get(messagesRoute, {
          status: 500,
          body: {
            error: "Server error",
          },
        });
        const router = createMemoryRouter(
          [
            {
              ErrorBoundary,
              children: [
                {
                  path: "/friends/:userId",
                  Component: TwoUsersChatPage,
                },
              ],
            },
          ],
          { initialEntries: ["/friends/userId"] },
        );
        renderWithProviders(<RouterProvider router={router} />);

        const errorBoundaryHeading = await screen.findByRole("heading", {
          level: 1,
          name: "Unexpected error occurred",
        });
        const errorMessage = screen.getByText("Server error");

        expect(errorBoundaryHeading).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });
    });

    describe("given not found userId", () => {
      it("should navigate back with an error message", async () => {
        expect.hasAssertions();

        vi.spyOn(notistackLibrary, "useSnackbar").mockImplementation(() => {
          return {
            closeSnackbar: () => undefined,
            enqueueSnackbar: mockEnqueueSnackbar,
          };
        });
        fetchMock.get(messagesRoute, {
          status: 404,
          body: {
            errors: [{ message: "User not found." }],
          },
        });
        const router = createMemoryRouter(
          [
            {
              path: "/friends/:userId",
              Component: TwoUsersChatPage,
            },
            {
              path: "/",
              Component: () => <p>Home page</p>,
            },
          ],
          { initialEntries: ["/", "/friends/userId"] },
        );
        renderWithProviders(<RouterProvider router={router} />);

        const homePageText = await screen.findByText("Home page");

        expect(mockEnqueueSnackbar).toHaveBeenCalledWith("User not found.", {
          variant: "error",
        });
        expect(homePageText).toBeInTheDocument();
      });
    });
  });
});

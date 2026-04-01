import { describe, beforeAll, afterEach, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  createRoutesStub,
  RouterProvider,
} from "react-router";
import * as notistackLibrary from "notistack";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import serverUrl from "@/utils/serverUrl";
import ErrorBoundary from "@/components/ErrorBoundary";
import TwoUsersChatPage from "@/pages/TwoUsersChatPage";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import type { ChatData, User } from "@/types/modelsType";

const messagesRoute = `${serverUrl}/users/userId/messages`;
const getCurrentUserRoute = `${serverUrl}/auth/get-user`;

const mockEnqueueSnackbar = vi.fn<notistackLibrary.EnqueueSnackbar>();

const mockChatData: ChatData = {
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
  user: {
    imageUrl: null,
    lastSeen: null,
    username: "userB",
  },
  friendRequestStatus: null,
};

const mockCurrentUser: { user: User } = {
  user: {
    id: "currentUserId",
    imageUrl: null,
    isGuest: false,
    lastSeen: new Date().toDateString(),
    username: "currentUsername",
  },
};

describe("two-users-chat-page component", () => {
  // scrollTo is not implemented in jsdom
  vi.spyOn(window.HTMLElement.prototype, "scrollTo").mockImplementation(
    () => "null",
  );

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
      it("should navigate to homepage with an error message", async () => {
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
        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: TwoUsersChatPage,
          },
          {
            path: "/",
            Component: () => <p>Home page</p>,
          },
        ]);
        renderWithProviders(<Stub initialEntries={["/friends/userId"]} />);

        const homePageText = await screen.findByText("Home page");

        expect(mockEnqueueSnackbar).toHaveBeenCalledWith("User not found.", {
          variant: "error",
        });
        expect(homePageText).toBeInTheDocument();
      });
    });

    describe("given loading state", () => {
      it("should render Loader component", () => {
        expect.hasAssertions();

        fetchMock.get(messagesRoute, {
          status: 200,
          body: mockChatData,
        });
        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: TwoUsersChatPage,
          },
        ]);
        renderWithProviders(<Stub initialEntries={["/friends/userId"]} />);

        const loader = screen.getByTestId("loader");

        expect(loader).toBeInTheDocument();
      });
    });

    describe("given child components", () => {
      it("should render UserChat component", async () => {
        expect.hasAssertions();

        vi.spyOn(localStorageService, "getJwtToken").mockReturnValue(
          "jwtToken",
        );
        fetchMock.get(getCurrentUserRoute, {
          status: 200,
          body: mockCurrentUser,
        });
        fetchMock.get(messagesRoute, {
          status: 200,
          body: mockChatData,
        });
        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: TwoUsersChatPage,
          },
        ]);
        renderWithProviders(<Stub initialEntries={["/friends/userId"]} />);

        const userChatComponentText = await screen.findByText(
          "Chatting with userB",
        );

        expect(userChatComponentText).toBeInTheDocument();
      });
    });

    describe("given successful sent message", () => {
      it("should re-fetch messages", async () => {
        expect.hasAssertions();

        vi.spyOn(localStorageService, "getJwtToken").mockReturnValue(
          "jwtToken",
        );
        fetchMock.get(getCurrentUserRoute, {
          status: 200,
          body: mockCurrentUser,
        });
        fetchMock.post(messagesRoute, {
          status: 201,
          body: {
            messageContent: "secondMessageFromUserA",
          },
        });
        fetchMock.get(messagesRoute, {
          status: 200,
          body: mockChatData,
        });
        fetchMock.get(messagesRoute, {
          status: 200,
          body: {
            ...mockChatData,
            messages: [
              ...mockChatData.messages,
              {
                content: "secondMessageFromUserA",
                createdAt: new Date().toISOString(),
                groupChatId: null,
                id: "secondMessageIdUserA",
                imageUrl: null,
                senderId: "userAId",
                receiverId: "userBId",
              },
            ],
          },
        });
        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: TwoUsersChatPage,
          },
        ]);
        renderWithProviders(<Stub initialEntries={["/friends/userId"]} />);
        const sendMessageTextField =
          await screen.findByPlaceholderText("Message");
        const sendMessageButton = screen.getByRole("button", {
          name: "send message",
        });

        await userEvent.type(sendMessageTextField, "secondMEssageFromUserA");
        await userEvent.click(sendMessageButton);

        expect(fetchMock).toHavePosted(messagesRoute);
        expect(fetchMock).toHaveGotTimes(2, messagesRoute);
      });
    });
  });
});

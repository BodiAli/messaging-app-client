import { createRoutesStub } from "react-router";
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import UserChat from "@/components/UserChat";
import type { ChatData } from "@/types/modelsType";

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
    lastSeen: new Date().toISOString(),
    username: "userB",
  },
};

describe("user-chat component", () => {
  function renderUserChat({ isFriend }: { isFriend: boolean }) {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: () => (
          <UserChat chatData={mockChatData} isFriend={isFriend} />
        ),
      },
    ]);

    return renderWithProviders(<Stub />);
  }

  describe("back button navigation", () => {
    describe("given rendering back button", () => {
      it("should render a back button with an icon", () => {
        expect.hasAssertions();

        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: () => <UserChat chatData={mockChatData} isFriend />,
          },
        ]);
        renderWithProviders(<Stub initialEntries={["/friends/userId"]} />);

        const backButton = screen.getByRole("button", {
          name: "back",
        });
        const backIcon = within(backButton).getByTestId("ArrowBackIcon");

        expect(backButton).toBeInTheDocument();
        expect(backIcon).toBeInTheDocument();
      });
    });

    describe("given click back button", () => {
      it("should navigate back", async () => {
        expect.hasAssertions();

        const Stub = createRoutesStub([
          {
            path: "/friends/:userId",
            Component: () => <UserChat chatData={mockChatData} isFriend />,
          },
          {
            path: "/test",
            Component: () => <p>Test</p>,
          },
        ]);
        renderWithProviders(
          <Stub initialEntries={["/test", "/friends/userId"]} />,
        );

        const backButton = screen.getByRole("button", {
          name: "back",
        });
        await userEvent.click(backButton);
        const testElement = screen.getByText("Test");

        expect(testElement).toBeInTheDocument();
      });
    });
  });

  describe("rendering messages data", () => {
    describe("given name of the current user being chatted with", () => {
      it("should render the name of the current user", () => {
        expect.hasAssertions();

        renderUserChat({ isFriend: true });

        const currentUser = screen.getByRole("heading", {
          name: `Chatting with ${mockChatData.user.username}`,
        });

        expect(currentUser).toBeInTheDocument();
      });
    });

    describe("give user is a friend", () => {
      it("should not render a button to add as a friend if user is friend", () => {
        expect.hasAssertions();

        renderUserChat({ isFriend: true });

        const addFriend = screen.queryByRole("button", {
          name: "Add as a friend",
        });

        expect(addFriend).not.toBeInTheDocument();
      });
    });

    describe("given user is not a friend", () => {
      it("should render an add as a friend button", () => {
        expect.hasAssertions();

        renderUserChat({ isFriend: false });

        const addFriend = screen.getByRole("button", {
          name: "Add as a friend",
        });

        expect(addFriend).toBeInTheDocument();
      });
    });
  });

  describe("adding a friend", () => {
    describe("given an unexpected error", () => {
      it.todo("should render ErrorBoundary");
    });
  });
});

import { describe, it, expect, assert } from "vitest";
import { screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import renderWithProviders from "@/utils/test-utils";
import Chatting from "@/components/Chatting";
import type { GroupMessages, Messages } from "@/types/modelsType";

vi.mock(import("@/components/SendMessage"), () => {
  return {
    default: () => {
      return <form aria-label="send message form"></form>;
    },
  };
});

describe("chatting component", () => {
  const mockUsersMessages: Messages = [
    {
      content: "messageFromUserA",
      createdAt: new Date("2020-01-01T01:30:00").toISOString(),
      groupChatId: null,
      id: "messageId1",
      imageUrl: null,
      receiverId: "userBId",
      senderId: "userAId",
    },
    {
      content: "messageFromUserB",
      createdAt: new Date("2020-01-02T02:00:00").toISOString(),
      groupChatId: null,
      id: "messageId2",
      imageUrl: "imageUrl",
      receiverId: "userAId",
      senderId: "userBId",
    },
  ];

  const mockGroupMessages: GroupMessages["messages"] = [
    {
      content: "Test-Message content 1",
      createdAt: "2020-01-01T01:30:30",
      groupChatId: "Test-GroupId",
      id: "Test-MessageId",
      imageUrl: "Test-ImageUrl",
      receiverId: null,
      senderId: "Test-UserAId",
      sender: {
        id: "Test-UserAId",
        imageUrl: "Test-ImageUrl",
        username: "Test-User A username",
      },
    },
    {
      content: "Test-Message content 2",
      createdAt: "2020-01-02T02:30:30",
      groupChatId: "Test-GroupId",
      id: "Test-MessageId1",
      imageUrl: null,
      receiverId: null,
      senderId: "Test-UserBId",
      sender: {
        id: "Test-UserBId",
        imageUrl: null,
        username: "Test-User B username",
      },
    },
  ];

  function renderChattingComponent(
    messages: Messages | GroupMessages["messages"],
  ) {
    const Stub = createRoutesStub([
      {
        path: "/:userId",
        Component: () => (
          <Chatting
            messages={messages}
            isFetching={false}
            currentUserId="currentUserId"
          />
        ),
      },
    ]);
    return renderWithProviders(<Stub initialEntries={["/userId"]} />);
  }

  describe("rendering empty messages", () => {
    it("should render no messages", () => {
      expect.hasAssertions();

      renderChattingComponent([]);

      const messages = screen.queryAllByText(/^messageFromUser/);

      expect(messages).toHaveLength(0);
    });
  });

  describe("rendering users messages array", () => {
    it("should render message content", () => {
      expect.hasAssertions();

      renderChattingComponent(mockUsersMessages);

      const firstMessage = screen.getByText("messageFromUserA");
      const secondMessage = screen.getByText("messageFromUserB");

      expect(firstMessage).toHaveTextContent("messageFromUserA");
      expect(secondMessage).toHaveTextContent("messageFromUserB");
    });

    it("should render message image when imageUrl is not null", () => {
      expect.hasAssertions();

      renderChattingComponent(mockUsersMessages);

      const messageImage = screen.getByRole("img", {
        name: "user sent image",
      });

      expect(messageImage).toBeInTheDocument();
    });

    it("should render when was the message created", () => {
      expect.hasAssertions();

      renderChattingComponent(mockUsersMessages);

      const messagesTime = screen.getAllByRole("time");
      assert(messagesTime[0]);
      assert(messagesTime[1]);
      const firstMessageTime = messagesTime[0];
      const secondMessageTime = messagesTime[1];

      expect(firstMessageTime).toHaveTextContent("Jan 1, 2020, 01:30 AM");
      expect(secondMessageTime).toHaveTextContent("Jan 2, 2020, 02:00 AM");
    });
  });

  describe("rendering group messages array", () => {
    it("should render message content", () => {
      expect.hasAssertions();

      renderChattingComponent(mockGroupMessages);

      const firstGroupMessage = screen.getByText("Test-Message content 1");
      const secondGroupMessage = screen.getByText("Test-Message content 2");

      expect(firstGroupMessage).toBeInTheDocument();
      expect(secondGroupMessage).toBeInTheDocument();
    });

    it("should render message image when imageUrl is not null", () => {
      expect.hasAssertions();

      renderChattingComponent(mockGroupMessages);

      const messageImage = screen.getByRole("img", {
        name: "user sent image",
      });

      expect(messageImage).toBeInTheDocument();
    });

    it("should render when was the message created", () => {
      expect.hasAssertions();

      renderChattingComponent(mockGroupMessages);

      const messagesTime = screen.getAllByRole("time");
      assert(messagesTime[0]);
      assert(messagesTime[1]);
      const firstMessageTime = messagesTime[0];
      const secondMessageTime = messagesTime[1];

      expect(firstMessageTime).toHaveTextContent("Jan 1, 2020, 01:30 AM");
      expect(secondMessageTime).toHaveTextContent("Jan 2, 2020, 02:30 AM");
    });

    it("should render message sender profile picture", () => {
      expect.hasAssertions();

      renderChattingComponent(mockGroupMessages);

      const userAProfilePicture = screen.getByRole("img", {
        name: "Test-User A username's profile picture",
      });
      const userBProfilePicture = screen.getByTitle(
        "Test-User B username no profile picture",
      );

      expect(userAProfilePicture).toBeInTheDocument();
      expect(userBProfilePicture).toBeInTheDocument();
    });

    it("should render message sender username", () => {
      expect.hasAssertions();

      renderChattingComponent(mockGroupMessages);

      const userAUsername = screen.getByText("Test-User A username");
      const userBUsername = screen.getByText("Test-User B username");

      expect(userAUsername).toBeInTheDocument();
      expect(userBUsername).toBeInTheDocument();
    });
  });
});

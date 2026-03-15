import { describe, it, expect, assert } from "vitest";
import { screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import renderWithProviders from "@/utils/test-utils";
import Chatting from "@/components/Chatting";
import type { Messages } from "@/types/modelsType";

vi.mock(import("@/components/SendMessage"), () => {
  return {
    default: () => {
      return <form aria-label="send message form"></form>;
    },
  };
});

describe("chatting component", () => {
  const mockMessages: Messages = [
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

  function renderChattingComponent(messages: Messages) {
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

  describe("rendering messages", () => {
    describe("given no messages", () => {
      it("should render no messages", () => {
        expect.hasAssertions();

        renderChattingComponent([]);

        const messages = screen.queryAllByText(/^messageFromUser/);

        expect(messages).toHaveLength(0);
      });
    });

    describe("given messages array", () => {
      it("should render message content", () => {
        expect.hasAssertions();

        renderChattingComponent(mockMessages);

        const firstMessage = screen.getByText("messageFromUserA");
        const secondMessage = screen.getByText("messageFromUserB");

        expect(firstMessage).toHaveTextContent("messageFromUserA");
        expect(secondMessage).toHaveTextContent("messageFromUserB");
      });

      it("should render message image when imageUrl is not null", () => {
        expect.hasAssertions();

        renderChattingComponent(mockMessages);

        const messageImage = screen.getByRole("img", {
          name: "user sent image",
        });

        expect(messageImage).toBeInTheDocument();
      });

      it("should render when was the message created", () => {
        expect.hasAssertions();

        renderChattingComponent(mockMessages);

        const messagesTime = screen.getAllByRole("time");
        assert(messagesTime[0]);
        assert(messagesTime[1]);
        const firstMessageTime = messagesTime[0];
        const secondMessageTime = messagesTime[1];

        expect(firstMessageTime).toHaveTextContent("Jan 1, 2020, 01:30 AM");
        expect(secondMessageTime).toHaveTextContent("Jan 2, 2020, 02:00 AM");
      });
    });
  });

  describe("rendering child components", () => {
    it("should render SendMessage form component", () => {
      expect.hasAssertions();

      renderChattingComponent(mockMessages);

      const sendMessageForm = screen.getByRole("form", {
        name: "send message form",
      });

      expect(sendMessageForm).toBeInTheDocument();
    });
  });
});

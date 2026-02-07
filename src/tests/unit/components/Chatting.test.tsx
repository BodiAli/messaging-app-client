import { describe, it, expect, assert } from "vitest";
import { screen } from "@testing-library/react";
import renderWithProviders from "@/utils/test-utils";
import Chatting from "@/components/Chatting";
import type { Messages } from "@/types/modelsType";

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

  describe("rendering messages", () => {
    describe("given no messages", () => {
      it("should render no messages", () => {
        expect.hasAssertions();

        renderWithProviders(<Chatting messages={[]} />);

        const messages = screen.queryAllByRole("paragraph");

        expect(messages).toHaveLength(0);
      });
    });

    describe("given messages array", () => {
      it("should render message content", () => {
        expect.hasAssertions();

        renderWithProviders(<Chatting messages={mockMessages} />);

        const firstMessage = screen.getByText("messageFromUserA");
        const secondMessage = screen.getByText("messageFromUserB");

        expect(firstMessage).toHaveTextContent("messageFromUserA");
        expect(secondMessage).toHaveTextContent("messageFromUserB");
      });

      it("should render message image when imageUrl is not null", () => {
        expect.hasAssertions();

        renderWithProviders(<Chatting messages={mockMessages} />);

        const messageImage = screen.getByRole("img", {
          name: "user sent image",
        });

        expect(messageImage).toBeInTheDocument();
      });

      it("should render when was the message created", () => {
        expect.hasAssertions();

        renderWithProviders(<Chatting messages={mockMessages} />);

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
});

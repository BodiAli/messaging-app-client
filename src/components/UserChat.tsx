import type { Messages } from "@/types/modelsType";

interface UserChatProps {
  messages: Messages;
}

export default function UserChat({ messages }: UserChatProps) {
  return messages.map((message) => {
    return <p key={message.id}>{message.content}</p>;
  });
}

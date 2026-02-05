import { Box } from "@mui/material";
import type { Messages } from "@/types/modelsType";

interface ChattingProps {
  messages: Messages;
}

export default function Chatting({ messages }: ChattingProps) {
  return (
    <Box>
      {messages.map((message) => {
        return <p key={message.id}>{message.content}</p>;
      })}
    </Box>
  );
}

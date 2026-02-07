import { Box, Typography } from "@mui/material";
import formatDate from "@/utils/formatDate";
import SendMessage from "./SendMessage";
import type { Messages } from "@/types/modelsType";

interface ChattingProps {
  messages: Messages;
}

export default function Chatting({ messages }: ChattingProps) {
  return (
    <Box>
      <Box>
        {messages.map((message) => {
          return <Message key={message.id} message={message} />;
        })}
      </Box>
      <SendMessage />
    </Box>
  );
}

type Flatten<T> = T extends (infer K)[] ? K : never;

function Message({ message }: { message: Flatten<Messages> }) {
  return (
    <Box>
      {message.imageUrl && <Box component={"img"} alt="user sent image" />}
      <Typography>{message.content}</Typography>
      <Typography>
        Sent at <Box component={"time"}>{formatDate(message.createdAt)}</Box>
      </Typography>
    </Box>
  );
}

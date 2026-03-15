import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router";
import formatDate from "@/utils/formatDate";
import SendMessage from "./SendMessage";
import type { Messages } from "@/types/modelsType";

function assert(value: unknown): asserts value {
  if (!value) throw new Error("Value is not defined");
}

interface ChattingProps {
  messages: Messages;
  isFetching: boolean;
  currentUserId: string;
}

export default function Chatting({
  messages,
  isFetching,
  currentUserId,
}: ChattingProps) {
  const { userId } = useParams<"userId">();
  assert(userId);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current && !isFetching) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
      });
    }
  }, [isFetching]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        paddingX: 3,
      }}
    >
      <Box
        ref={messagesContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: 3,
          backgroundColor: "#ffffff73",
          minHeight: "300px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        {messages.map((message) => {
          const direction =
            message.senderId === currentUserId ? "end" : "start";
          const backgroundColor =
            message.senderId === currentUserId ? "#0055ff76" : "#b5b5b59e";
          return (
            <Message
              key={message.id}
              message={message}
              direction={direction}
              backgroundColor={backgroundColor}
              isLoading={isFetching}
            />
          );
        })}
      </Box>
      <SendMessage />
    </Box>
  );
}

type Flatten<T> = T extends (infer K)[] ? K : never;

function Message({
  message,
  direction,
  backgroundColor,
  isLoading,
}: {
  message: Flatten<Messages>;
  direction: string;
  backgroundColor: string;
  isLoading: boolean;
}) {
  return (
    <Box
      sx={{
        alignSelf: direction,
        backgroundColor,
        padding: 1,
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxWidth: "400px",
        opacity: isLoading ? 0.5 : "initial",
      }}
    >
      {message.imageUrl && (
        <Box
          sx={{
            alignSelf: "center",
          }}
        >
          <Box
            component={"img"}
            alt="user sent image"
            src={message.imageUrl}
            sx={{
              width: "300px",
            }}
          />
        </Box>
      )}
      <Typography>{message.content}</Typography>
      <Typography
        sx={{
          fontSize: "0.8rem",
          alignSelf: "end",
        }}
      >
        <Box component={"time"}>{formatDate(message.createdAt)}</Box>
      </Typography>
    </Box>
  );
}

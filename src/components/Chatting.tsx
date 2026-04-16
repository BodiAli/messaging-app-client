import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import formatDate from "@/utils/formatDate";
import UsersAvatar from "./UsersAvatar";
import type { GroupMessages, Messages } from "@/types/modelsType";

interface ChattingProps {
  messages: Messages | GroupMessages["messages"];
  isFetching: boolean;
  currentUserId: string;
}

export default function Chatting({
  messages,
  isFetching,
  currentUserId,
}: ChattingProps) {
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
        paddingX: {
          sm: 3,
          xs: 1,
        },
      }}
    >
      <Box
        ref={messagesContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: {
            xs: 2,
            sm: 3,
          },
          backgroundColor: "#ffffff73",
          minHeight: "500px",
          maxHeight: "700px",
          overflowY: "auto",
        }}
      >
        {messages.map((message) => {
          const direction =
            message.senderId === currentUserId ? "end" : "start";
          const backgroundColor =
            message.senderId === currentUserId ? "#3f7fffb9" : "#b5b5b59e";
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
  message: Flatten<Messages> | Flatten<GroupMessages["messages"]>;
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
        maxWidth: {
          xs: "300px",
          sm: "400px",
        },
        opacity: isLoading ? 0.5 : "initial",
      }}
    >
      {message.groupChatId && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: 1,
          }}
        >
          <UsersAvatar
            imageUrl={message.sender.imageUrl}
            username={message.sender.username}
          />
          <Typography>{message.sender.username}</Typography>
        </Box>
      )}
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
              width: {
                xs: "200px",
                sm: "300px",
              },
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

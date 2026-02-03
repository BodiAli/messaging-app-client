import { useNavigate, useParams } from "react-router";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import UsersAvatar from "./UsersAvatar";
import type { ChatData } from "@/types/modelsType";

function assert(value: unknown): asserts value {
  if (!value) throw new Error("Value is not defined");
}

interface UserChatProps {
  chatData: ChatData;
}

export default function UserChat({ chatData }: UserChatProps) {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { userId } = useParams<"userId">();
  assert(user);
  assert(userId);

  const friendShipAction = renderFriendshipAction(chatData, user.id, userId);

  return (
    <Box>
      <Box>
        <IconButton
          aria-label="back"
          onClick={() => {
            void navigate(-1);
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <UsersAvatar
          imageUrl={chatData.user.imageUrl}
          username={chatData.user.username}
        />
        <Typography variant="h2">
          Chatting with {chatData.user.username}
        </Typography>
        {friendShipAction}
      </Box>
      <Box>
        {chatData.messages.map((message) => {
          return <p key={message.id}>{message.content}</p>;
        })}
      </Box>
    </Box>
  );
}

function renderFriendshipAction(
  chatData: ChatData,
  currentUserId: string,
  recipientId: string,
) {
  if (!chatData.friendRequestStatus) {
    return <Button>Add as a friend</Button>;
  }
  if (chatData.friendRequestStatus.type === "ACCEPTED") {
    return null;
  }
  if (
    chatData.friendRequestStatus.type === "PENDING" &&
    chatData.friendRequestStatus.senderId === recipientId
  ) {
    return (
      <>
        <Button>Accept</Button>
        <Button>Decline</Button>
      </>
    );
  }
  if (
    chatData.friendRequestStatus.type === "PENDING" &&
    chatData.friendRequestStatus.senderId === currentUserId
  ) {
    return <Button>Cancel request</Button>;
  }

  throw new Error("Unknown action");
}

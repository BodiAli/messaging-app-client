import { useNavigate, useParams } from "react-router";
import {
  Badge,
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import isOnline from "@/utils/isOnline";
import UsersAvatar from "./UsersAvatar";
import Chatting from "./Chatting";
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
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          gap: "1rem",
          padding: 3,
          justifyContent: "center",
        }}
      >
        <IconButton
          sx={{
            marginRight: "auto",
          }}
          aria-label="back"
          onClick={() => {
            void navigate(-1);
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Badge
          variant="dot"
          color="success"
          overlap="circular"
          invisible={
            chatData.user.lastSeen ? !isOnline(chatData.user.lastSeen) : true
          }
          slotProps={{
            badge() {
              return {
                "data-testid": "online-badge",
              };
            },
          }}
        >
          <UsersAvatar
            imageUrl={chatData.user.imageUrl}
            username={chatData.user.username}
          />
        </Badge>
        <Typography
          variant="h4"
          component={"h2"}
          sx={{
            marginRight: "auto",
          }}
        >
          Chatting with {chatData.user.username}
        </Typography>
        {friendShipAction}
      </Stack>
      <Chatting messages={chatData.messages} />
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
  if (chatData.friendRequestStatus.senderId === recipientId) {
    return (
      <>
        <Button>Accept</Button>
        <Button>Decline</Button>
      </>
    );
  }
  if (chatData.friendRequestStatus.senderId === currentUserId) {
    return <Button>Cancel request</Button>;
  }

  throw new Error("Unknown action");
}

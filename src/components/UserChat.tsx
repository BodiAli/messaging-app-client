import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import { useState } from "react";
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
import { useAddFriendMutation } from "@/slices/friendsSlice";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";
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
  const [fatalError, setFatalError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const { userId } = useParams<"userId">();
  assert(currentUser);
  assert(userId);

  const [addFriend, { isLoading }] = useAddFriendMutation();

  const handleFriendshipAction = async () => {
    try {
      const { message } = await addFriend(userId).unwrap();

      enqueueSnackbar(message, {
        variant: "success",
      });
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isServerError(error.data)) {
          setFatalError(error.data.error);
        }

        if (isClientError(error.data)) {
          error.data.errors.map((error) => {
            enqueueSnackbar(error.message, { variant: "error" });
          });
        }
      }
    }
  };

  if (fatalError) {
    throw new Error(fatalError);
  }

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
        <FriendshipAction
          chatData={chatData}
          currentUserId={currentUser.id}
          recipientId={userId}
          isLoading={isLoading}
          onActionClick={handleFriendshipAction}
        />
      </Stack>
      <Chatting messages={chatData.messages} currentUserId={currentUser.id} />
    </Box>
  );
}

interface FriendshipActionProps {
  chatData: ChatData;
  currentUserId: string;
  recipientId: string;
  isLoading: boolean;
  onActionClick: () => void;
}

function FriendshipAction({
  chatData,
  currentUserId,
  recipientId,
  onActionClick,
  isLoading,
}: FriendshipActionProps) {
  if (!chatData.friendRequestStatus) {
    return (
      <Button
        loading={isLoading}
        onClick={() => {
          onActionClick();
        }}
      >
        Add as a friend
      </Button>
    );
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
}

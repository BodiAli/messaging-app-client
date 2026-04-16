import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import {
  useState,
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
} from "react";
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
import { useSendMessageMutation } from "@/slices/messagesSlice";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";
import {
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from "@/slices/notificationsSlice";
import UsersAvatar from "./UsersAvatar";
import Chatting from "./Chatting";
import SendMessage from "./SendMessage";
import type { ChatData } from "@/types/modelsType";

function assert(value: unknown): asserts value {
  if (!value) throw new Error("Value is not defined");
}

interface FormFields extends HTMLFormControlsCollection {
  messageContent: HTMLInputElement;
  messageImage: HTMLInputElement;
}

interface FormWithElements extends HTMLFormElement {
  elements: FormFields;
}

interface UserChatProps {
  chatData: ChatData;
  isFetching: boolean;
}
export default function UserChat({ chatData, isFetching }: UserChatProps) {
  const [fatalError, setFatalError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const { userId } = useParams<"userId">();
  const [addFriend, { isLoading: isAddingFriend }] = useAddFriendMutation();
  const [sendMessage, { isLoading: isSendingMessage }] =
    useSendMessageMutation();
  const [acceptFriendRequest, { isLoading: isAcceptingRequest }] =
    useAcceptFriendRequestMutation();
  const [declineFriendRequest, { isLoading: isDecliningRequest }] =
    useDeclineFriendRequestMutation();
  assert(currentUser);
  assert(userId);

  if (fatalError) {
    throw new Error(fatalError);
  }

  const isFriendshipActionLoading =
    isAddingFriend || isAcceptingRequest || isDecliningRequest;

  const handleAddFriend = async () => {
    try {
      const { message } = await addFriend(userId).unwrap();

      enqueueSnackbar(message, {
        variant: "success",
      });
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isServerError(error.data)) {
          setFatalError(error.data.error);
          return;
        }

        if (isClientError(error.data)) {
          error.data.errors.map((error) => {
            enqueueSnackbar(error.message, { variant: "error" });
          });
          return;
        }
      }

      if (Error.isError(error)) {
        setFatalError(error.message);
      }
    }
  };

  const handleAcceptFriendRequest = async (friendRequestId: string) => {
    try {
      await acceptFriendRequest(friendRequestId).unwrap();
      enqueueSnackbar("Friend request accepted.", {
        variant: "success",
      });
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isServerError(error.data)) {
          setFatalError(error.data.error);
          return;
        }

        if (isClientError(error.data)) {
          error.data.errors.map((error) => {
            enqueueSnackbar(error.message, { variant: "error" });
          });
          return;
        }
      }

      if (Error.isError(error)) {
        setFatalError(error.message);
      }
    }
  };

  const handleDeclineFriendRequest = async (
    friendRequestId: string,
    snackbarMessage: string,
  ) => {
    try {
      await declineFriendRequest(friendRequestId).unwrap();
      enqueueSnackbar(snackbarMessage, {
        variant: "success",
      });
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isServerError(error.data)) {
          setFatalError(error.data.error);
          return;
        }

        if (isClientError(error.data)) {
          error.data.errors.map((error) => {
            enqueueSnackbar(error.message, { variant: "error" });
          });
          return;
        }
      }

      if (Error.isError(error)) {
        setFatalError(error.message);
      }
    }
  };

  const handleSubmit = (
    setUploadedImageUrl: Dispatch<SetStateAction<string | null>>,
  ) => {
    return async (e: SubmitEvent<FormWithElements>) => {
      e.preventDefault();
      const { messageImage: messageImageElement } = e.currentTarget.elements;
      assert(messageImageElement.files);
      const messageImage = messageImageElement.files[0];

      const messageContent = e.currentTarget.elements.messageContent.value;
      if (messageContent.trim().length === 0) {
        alert("Cannot send an empty message");
        return;
      }

      const formData = new FormData();
      formData.append("messageContent", messageContent);
      if (messageImage) {
        formData.append("messageImage", messageImage);
      }

      try {
        await sendMessage({ userId, formData }).unwrap();

        setUploadedImageUrl(null);
        e.target.reset();
      } catch (error) {
        if (isFetchBaseQueryError(error)) {
          if (isServerError(error.data)) {
            setFatalError(error.data.error);
            return;
          }
          if (isClientError(error.data)) {
            error.data.errors.forEach((error) => {
              enqueueSnackbar(error.message, { variant: "error" });
            });
          }
        }
      }
    };
  };

  return (
    <Box>
      <Stack
        sx={{
          alignItems: "center",
          gap: "1rem",
          padding: 3,
          justifyContent: "center",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
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
            marginRight: {
              sm: "auto",
            },
          }}
        >
          Chatting with {chatData.user.username}
        </Typography>
        <FriendshipAction
          chatData={chatData}
          currentUserId={currentUser.id}
          recipientId={userId}
          isLoading={isFriendshipActionLoading}
          onAddFriend={handleAddFriend}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onDeclineOrDeleteOrCancelFriendRequest={handleDeclineFriendRequest}
        />
      </Stack>
      <Chatting
        messages={chatData.messages}
        isFetching={isFetching}
        currentUserId={currentUser.id}
      />
      <SendMessage
        key={userId}
        isLoading={isSendingMessage}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

interface FriendshipActionProps {
  chatData: ChatData;
  currentUserId: string;
  recipientId: string;
  isLoading: boolean;
  onAddFriend: () => Promise<void>;
  onAcceptFriendRequest: (friendRequestId: string) => Promise<void>;
  onDeclineOrDeleteOrCancelFriendRequest: (
    friendRequestId: string,
    snackbarMessage: string,
  ) => Promise<void>;
}

function FriendshipAction({
  chatData,
  currentUserId,
  recipientId,
  onAddFriend,
  onAcceptFriendRequest,
  onDeclineOrDeleteOrCancelFriendRequest,
  isLoading,
}: FriendshipActionProps) {
  if (!chatData.friendRequestStatus) {
    return (
      <Button
        loading={isLoading}
        onClick={() => {
          void onAddFriend();
        }}
      >
        Add as a friend
      </Button>
    );
  }

  if (chatData.friendRequestStatus.type === "ACCEPTED") {
    return (
      <Button
        color="error"
        loading={isLoading}
        onClick={() => {
          void onDeclineOrDeleteOrCancelFriendRequest(
            chatData.friendRequestStatus.id,
            "Friend removed.",
          );
        }}
      >
        Remove friend
      </Button>
    );
  }

  if (chatData.friendRequestStatus.senderId === recipientId) {
    return (
      <>
        <Button
          color="info"
          loading={isLoading}
          onClick={() => {
            void onAcceptFriendRequest(chatData.friendRequestStatus.id);
          }}
        >
          Accept
        </Button>
        <Button
          color="error"
          loading={isLoading}
          onClick={() => {
            void onDeclineOrDeleteOrCancelFriendRequest(
              chatData.friendRequestStatus.id,
              "Friend request declined.",
            );
          }}
        >
          Decline
        </Button>
      </>
    );
  }
  if (chatData.friendRequestStatus.senderId === currentUserId) {
    return (
      <Button
        loading={isLoading}
        onClick={() => {
          void onDeclineOrDeleteOrCancelFriendRequest(
            chatData.friendRequestStatus.id,
            "Friend request canceled.",
          );
        }}
      >
        Cancel request
      </Button>
    );
  }
}

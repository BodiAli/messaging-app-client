import {
  useEffect,
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
} from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router";
import { Box, Link } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import Loader from "@/components/Loader/Loader";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
import Chatting from "@/components/Chatting";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import SendMessage from "@/components/SendMessage";

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is undefined");
  }
}

interface FormFields extends HTMLFormControlsCollection {
  messageContent: HTMLInputElement;
  messageImage: HTMLInputElement;
}

interface FormWithElements extends HTMLFormElement {
  elements: FormFields;
}

export default function GroupChatPage() {
  const { groupId } = useParams<"groupId">();
  assert(groupId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    data,
    isError: isGetMessageError,
    isLoading: isGetMessagesLoading,
    isFetching,
    error: getMessageError,
  } = useGetGroupMessagesQuery(groupId);
  const [
    sendMessage,
    {
      isLoading: isSendingMessage,
      isError: isMessageError,
      error: messageError,
    },
  ] = useSendGroupMessageMutation();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

  useEffect(() => {
    if (isGetMessageError) {
      if (
        isFetchBaseQueryError(getMessageError) &&
        isClientError(getMessageError.data)
      ) {
        getMessageError.data.errors.forEach((error) => {
          enqueueSnackbar(error.message, { variant: "error" });
        });
        void navigate("/", { replace: true });
      } else {
        handleUnexpectedError(getMessageError);
      }
    }
  }, [isGetMessageError, getMessageError, enqueueSnackbar, navigate]);

  if (isGetMessagesLoading || !data) {
    return <Loader />;
  }

  if (isMessageError) {
    if (
      isFetchBaseQueryError(messageError) &&
      isClientError(messageError.data)
    ) {
      messageError.data.errors.forEach((error) => {
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      });
    } else {
      handleUnexpectedError(messageError);
    }
  }

  const handleMessageSubmit = (
    setUploadedImageUrl: Dispatch<SetStateAction<string | null>>,
  ) => {
    return async function (e: SubmitEvent<FormWithElements>) {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);
      const messageContent = form.elements.messageContent.value;
      const messageImage = form.elements.messageImage.files?.[0];

      if (messageContent.trim().length === 0) {
        alert("Cannot send an empty message");
        return;
      }

      if (messageImage) {
        formData.append("messageImage", messageContent);
      }

      await sendMessage({ groupId, formData });
      form.reset();
      setUploadedImageUrl(null);
    };
  };

  return (
    <Box
      component={"section"}
      sx={{
        paddingY: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Link
          component={RouterLink}
          to="details"
          sx={{
            color: "#fff",
            textDecoration: "none",
            paddingY: 1,
            paddingX: 2,
            marginBottom: 3,
            borderRadius: "5px",
            fontSize: "1.1rem",
            transition: "background-color 200ms",
            backgroundColor: (theme) => theme.palette.primary.light,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.main,
            },
          }}
        >
          {data.group.name}
        </Link>
      </Box>
      <Chatting
        currentUserId={currentUser.id}
        isFetching={isFetching}
        messages={data.messages}
      />
      <SendMessage
        isLoading={isSendingMessage}
        onSubmit={handleMessageSubmit}
      />
    </Box>
  );
}

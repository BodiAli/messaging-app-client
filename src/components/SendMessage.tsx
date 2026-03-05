import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react";
import { useParams } from "react-router";
import { Box, IconButton, styled, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SendIcon from "@mui/icons-material/Send";
import { useSendMessageMutation } from "@/slices/messagesSlice";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";

const VisuallyHiddenUpload = styled("input")({
  position: "absolute",
  overflow: "hidden",
  width: "100%",
  height: "100%",
  visibility: "hidden",
});

interface FormFields extends HTMLFormControlsCollection {
  messageContent: HTMLInputElement;
  messageImage: HTMLInputElement;
}

interface FormWithElements extends HTMLFormElement {
  elements: FormFields;
}

export default function SendMessage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<null | string>(null);
  const [messageContent, setMessageContent] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [fatalError, setFatalError] = useState<string | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { userId } = useParams<"userId">();
  assert(userId);

  if (fatalError) {
    throw new Error(fatalError);
  }

  useEffect(() => {
    assert(messageInputRef.current);
    if (!isLoading) {
      messageInputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: FormEvent<FormWithElements>) => {
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
      setMessageContent("");
      setUploadedImageUrl(null);
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

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    assert(e.currentTarget.files);
    const files = e.currentTarget.files;
    const file = files[0];

    if (file === undefined) {
      setUploadedImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedImageUrl(url);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        gap: 1,
      }}
      component={"form"}
      aria-label="send message form"
      onSubmit={handleSubmit}
    >
      <TextField
        inputRef={messageInputRef}
        name="messageContent"
        required
        disabled={isLoading}
        placeholder="Message"
        value={messageContent}
        onChange={(e) => {
          setMessageContent(e.target.value);
        }}
        sx={{
          flex: 1,
        }}
      />
      <IconButton
        component="label"
        title="attach image"
        loading={isLoading}
        sx={{
          position: "relative",
        }}
      >
        <AttachmentIcon />
        <VisuallyHiddenUpload
          type="file"
          accept="image/*"
          name="messageImage"
          onChange={handleUploadImage}
        />
      </IconButton>
      <IconButton type="submit" title="send message" loading={isLoading}>
        <SendIcon />
      </IconButton>
      {uploadedImageUrl && (
        <Box
          component={"img"}
          src={uploadedImageUrl}
          alt="uploaded image"
          sx={{
            width: "200px",
            height: "200px",
            objectFit: "contain",
          }}
        />
      )}
    </Box>
  );
}

function assert(val: unknown): asserts val {
  if (!val) throw new Error("Value is not defined");
}

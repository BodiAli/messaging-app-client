import { useState, type ChangeEvent, type FormEvent } from "react";
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
  const { enqueueSnackbar } = useSnackbar();
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { userId } = useParams<"userId">();
  assert(userId);

  if (fatalError) {
    throw new Error(fatalError);
  }

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
      formData.append("messageImage", messageContent);
    }

    try {
      await sendMessage({ userId, formData }).unwrap();
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
      component={"form"}
      aria-label="send message form"
      onSubmit={handleSubmit}
    >
      <TextField name="messageContent" required disabled={isLoading} />
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
        <Box component={"img"} src={uploadedImageUrl} alt="uploaded image" />
      )}
    </Box>
  );
}

function assert(val: unknown): asserts val {
  if (!val) throw new Error("Value is not defined");
}

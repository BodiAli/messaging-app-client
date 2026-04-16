import {
  useRef,
  type ChangeEvent,
  useEffect,
  type SubmitEvent,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Box, IconButton, styled, TextField } from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SendIcon from "@mui/icons-material/Send";

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

export default function SendMessage({
  onSubmit,
  isLoading,
}: {
  onSubmit: (
    setUploadedImageUrl: Dispatch<SetStateAction<string | null>>,
  ) => (e: SubmitEvent<FormWithElements>) => void;
  isLoading: boolean;
}) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    assert(messageInputRef.current);
    if (!isLoading) {
      messageInputRef.current.focus();
    }
  }, [isLoading]);

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
        gap: 1,
        paddingX: {
          sm: 3,
          xs: 1,
        },
        marginTop: 1,
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
      }}
      component={"form"}
      aria-label="send message form"
      onSubmit={onSubmit(setUploadedImageUrl)}
    >
      <TextField
        inputRef={messageInputRef}
        name="messageContent"
        required
        disabled={isLoading}
        placeholder="Message"
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
            border: "2px solid white",
          }}
        />
      )}
    </Box>
  );
}

function assert(val: unknown): asserts val {
  if (!val) throw new Error("Value is not defined");
}

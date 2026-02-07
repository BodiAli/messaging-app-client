import { useState, type ChangeEvent, type FormEvent } from "react";
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
}

interface FormWithElements extends HTMLFormElement {
  elements: FormFields;
}

export default function SendMessage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<null | string>(null);

  const handleSubmit = (e: FormEvent<FormWithElements>) => {
    e.preventDefault();

    const message = e.currentTarget.elements.messageContent;

    if (message.textContent.trim().length === 0) {
      alert("Cannot send an empty message");
    }
  };

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    assert(e.currentTarget.files);
    const files = e.currentTarget.files;

    if (files[0] === undefined) {
      setUploadedImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(files[0]);
    setUploadedImageUrl(url);
  };

  return (
    <Box
      component={"form"}
      aria-label="send message form"
      onSubmit={handleSubmit}
    >
      <TextField name="messageContent" required />
      <IconButton
        component="label"
        title="attach image"
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
      <IconButton type="submit" title="send message">
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

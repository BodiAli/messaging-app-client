import { useNavigate } from "react-router";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { ChatData } from "@/types/modelsType";

interface UserChatProps {
  chatData: ChatData;
  isFriend: boolean;
}

export default function UserChat({ chatData, isFriend }: UserChatProps) {
  const navigate = useNavigate();

  const addAsFriend: React.ReactNode = !isFriend ? (
    <Button>Add as a friend</Button>
  ) : null;

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
        <Typography variant="h2">
          Chatting with {chatData.user.username}
        </Typography>
        {addAsFriend}
      </Box>
    </Box>
  );
}

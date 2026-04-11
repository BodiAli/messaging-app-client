import type { User } from "@/types/modelsType";
import { Box, Typography } from "@mui/material";

export default function GroupMembers({
  groupMembers,
  isGroupAdmin,
}: {
  isGroupAdmin: boolean;
  groupMembers: Pick<User, "id" | "imageUrl" | "username">;
}) {
  return (
    <Box>
      <Typography>2 members</Typography>
    </Box>
  );
}

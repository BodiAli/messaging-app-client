import { Box, Typography } from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";

export default function FriendsPage() {
  const { data, isError, error } = useGetFriendsQuery(undefined);

  if (isError) {
    // If error is NOT an unauthorized error i.e., an unexpected error call handleUnexpectedError
    if (!isUnauthorized(error)) {
      handleUnexpectedError(error);
    }
  }

  return (
    <Box component="main">
      <Typography variant="h2">Your friends</Typography>
    </Box>
  );
}

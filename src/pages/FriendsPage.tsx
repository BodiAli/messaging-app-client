import { Navigate } from "react-router";
import { Box, Typography } from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";

export default function FriendsPage() {
  const { data, isError, error } = useGetFriendsQuery(undefined);

  if (isError) {
    if (isUnauthorized(error)) return <Navigate to="/log-in" />;

    handleUnexpectedError(error);
  }

  console.log("FRIENDS PAGE DATA", data);

  return (
    <Box component="main">
      <Typography variant="h2">Your friends</Typography>
    </Box>
  );
}

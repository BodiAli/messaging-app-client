import { Outlet } from "react-router";
import { Box, Stack, Typography } from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";
import FriendCard from "@/components/FriendCard";

export default function FriendsPage() {
  const { data, isError, error, isLoading } = useGetFriendsQuery(undefined);

  if (isError) {
    // If error is NOT an unauthorized error (i.e., an unexpected error) call handleUnexpectedError
    if (!isUnauthorized(error)) {
      handleUnexpectedError(error);
    }
  }

  if (isLoading) return <p>LOADING...</p>;

  return (
    <Box
      component="main"
      sx={{ display: "grid", gridTemplateColumns: "0.3fr 1fr", flex: 1 }}
    >
      <Box component="section">
        <Typography variant="h2" sx={{ paddingY: 3, textAlign: "center" }}>
          Your friends
        </Typography>
        <Stack spacing={5}>
          {data?.friends.map((friend) => {
            return <FriendCard key={friend.id} friend={friend} />;
          })}
        </Stack>
      </Box>
      <Outlet />
    </Box>
  );
}

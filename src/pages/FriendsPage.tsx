import { Outlet } from "react-router";
import { Box, Typography } from "@mui/material";
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
    <Box component="main">
      <Box component="section">
        <Typography variant="h2">Your friends</Typography>
        <Box>
          {data?.friends.map((friend) => {
            return <FriendCard key={friend.id} friend={friend} />;
          })}
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}

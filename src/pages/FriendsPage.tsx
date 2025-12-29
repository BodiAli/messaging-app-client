import { Link, Outlet } from "react-router";
import { Box, Typography } from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";

export default function FriendsPage() {
  const { data, isError, error, isLoading } = useGetFriendsQuery(undefined);

  // const data = {
  //   friends: [{ id: "123", username: "username" }],
  // };

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
            return (
              <Link
                key={friend.id}
                aria-label={`${friend.username} friend`}
                to={friend.id}
              >
                <Box>{friend.username}</Box>
              </Link>
            );
          })}
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}

import { Outlet } from "react-router";
import {
  Box,
  Card,
  CardHeader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";
import FriendCard from "@/components/FriendCard";

export default function FriendsPage() {
  const {
    data = { friends: [] },
    isError,
    error,
    isLoading,
  } = useGetFriendsQuery(undefined);

  if (isError) {
    // If error is NOT an unauthorized error (i.e., an unexpected error) call handleUnexpectedError
    if (!isUnauthorized(error)) {
      handleUnexpectedError(error);
    }
  }

  return (
    <Box
      component="main"
      sx={{ display: "grid", gridTemplateColumns: "0.3fr 1fr", flex: 1 }}
    >
      <Box component="section">
        <Typography variant="h2" sx={{ paddingY: 3, textAlign: "center" }}>
          Your friends
        </Typography>
        {isLoading ? (
          <Card>
            <CardHeader
              avatar={
                <Skeleton
                  height={40}
                  width={40}
                  variant="circular"
                  animation="wave"
                />
              }
              title={<Skeleton animation="wave" />}
            />
          </Card>
        ) : (
          <Stack spacing={5}>
            {data.friends.map((friend) => {
              return <FriendCard key={friend.id} friend={friend} />;
            })}
          </Stack>
        )}
      </Box>
      <Outlet />
    </Box>
  );
}

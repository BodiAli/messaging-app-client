import { useState } from "react";
import { Outlet } from "react-router";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Drawer,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useGetFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import isUnauthorized from "@/utils/isUnauthorized";
import FriendCard from "@/components/FriendCard";

export default function FriendsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const sortedFriends = data.friends.toSorted((a, b) => {
    if (a.username > b.username) {
      return 1;
    }
    if (a.username < b.username) {
      return -1;
    }
    return 0;
  });

  return (
    <Box
      component="main"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "0.3fr 1fr",
        },
        paddingBottom: {
          xs: 9,
          md: "initial",
        },
        flex: 1,
      }}
    >
      <Button
        sx={{
          paddingY: "1rem",
          display: {
            xs: "block",
            lg: "none",
          },
        }}
        onClick={toggleDrawer}
      >
        Open friends drawer
      </Button>
      <Drawer
        sx={{
          display: {
            xs: "block",
            lg: "none",
          },
        }}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
        slotProps={{
          paper: {
            sx: {
              padding: "1rem",
            },
          },
        }}
      >
        <Typography
          variant="h2"
          sx={{ paddingY: 3, textAlign: "center", fontSize: "3rem" }}
        >
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
        ) : sortedFriends.length === 0 ? (
          <Typography textAlign={"center"}>
            You currently have no friends
          </Typography>
        ) : (
          <Stack spacing={5}>
            {sortedFriends.map((friend) => {
              return <FriendCard key={friend.id} friend={friend} />;
            })}
          </Stack>
        )}
      </Drawer>
      <Box
        component="section"
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
          maxHeight: {
            lg: "700px",
          },
          overflowY: {
            lg: "auto",
          },
          scrollbarColor: {
            lg: "gray transparent",
          },
        }}
      >
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
        ) : sortedFriends.length === 0 ? (
          <Typography textAlign={"center"}>
            You currently have no friends
          </Typography>
        ) : (
          <Stack spacing={5}>
            {sortedFriends.map((friend) => {
              return <FriendCard key={friend.id} friend={friend} />;
            })}
          </Stack>
        )}
      </Box>
      <Outlet />
    </Box>
  );
}

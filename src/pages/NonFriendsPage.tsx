import {
  Box,
  Card,
  CardActionArea,
  CardHeader,
  Skeleton,
  Stack,
  Typography,
  type CardActionAreaProps,
} from "@mui/material";
import { NavLink, Outlet } from "react-router";
import { useGetNonFriendsQuery } from "@/slices/friendsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import UsersAvatar from "@/components/UsersAvatar";

const CustomActionArea = (
  props: CardActionAreaProps<"button", { to: string }>,
) => {
  return <CardActionArea {...props} />;
};

export default function NonFriendsPage() {
  const {
    data: { nonFriends } = { nonFriends: [] },
    isLoading,
    isError,
    error,
  } = useGetNonFriendsQuery(undefined);

  if (isError) {
    handleUnexpectedError(error);
  }

  const sortedNonFriends = nonFriends.toSorted((a, b) => {
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
      component={"main"}
      sx={{ display: "grid", gridTemplateColumns: "0.3fr 1fr", flex: 1 }}
    >
      <Box
        component={"section"}
        sx={{
          maxHeight: "700px",
          overflowY: "auto",
          scrollbarColor: "gray transparent",
        }}
      >
        <Typography variant="h2" sx={{ paddingY: 3, textAlign: "center" }}>
          Non-friends
        </Typography>

        {isLoading ? (
          <Card data-testid="skeleton">
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
        ) : sortedNonFriends.length === 0 ? (
          <Typography textAlign={"center"}>This list is empty,</Typography>
        ) : (
          <Stack spacing={5}>
            {sortedNonFriends.map((nonFriend) => {
              return (
                <Card key={nonFriend.id}>
                  <CustomActionArea
                    aria-label={`Chat with ${nonFriend.username}`}
                    LinkComponent={NavLink}
                    to={nonFriend.id}
                    sx={{
                      "&.active": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <UsersAvatar
                          imageUrl={nonFriend.imageUrl}
                          username={nonFriend.username}
                        />
                      }
                      title={nonFriend.username}
                    />
                  </CustomActionArea>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
      <Outlet />
    </Box>
  );
}

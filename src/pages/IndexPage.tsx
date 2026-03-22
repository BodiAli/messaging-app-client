import { Box, Typography } from "@mui/material";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import UsersAvatar from "@/components/UsersAvatar";

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value not defined");
  }
}

export default function IndexPage() {
  const user = useAppSelector(selectUser);
  assert(user);

  return (
    <Box
      component={"main"}
      sx={{
        flex: 1,
        display: "flex",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          marginTop: 4,
          gap: 4,
          borderRadius: "5px",
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <UsersAvatar imageUrl={user.imageUrl} username={user.username} />
          <Typography variant="h3" component="h1">
            Welcome {user.username}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography component={"p"} variant="h5">
            Chat with people all around the world.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

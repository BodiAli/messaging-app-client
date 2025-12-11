import { AppBar, Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink, NavLink } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";

export default function Header() {
  const user = useAppSelector(selectUser);

  let headerContent: React.ReactElement;

  if (!user) {
    headerContent = (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Button
            component={NavLink}
            to="/log-in"
            variant="outlined"
            sx={{
              flex: 1,
              color: "text.primary",
              backgroundColor: "secondary.dark",
              "&.active": {
                backgroundColor: "secondary.main",
              },
            }}
          >
            Log in
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Button
            component={NavLink}
            to="/sign-up"
            variant="outlined"
            sx={{
              flex: 1,
              color: "text.primary",
              backgroundColor: "secondary.dark",
              "&.active": {
                backgroundColor: "secondary.main",
              },
            }}
          >
            Sign up
          </Button>
        </Box>
      </Box>
    );
  } else {
    headerContent = <Box component={"img"} alt="See notifications" />;
  }

  return (
    <AppBar
      color="primary"
      sx={{
        paddingX: 4,
        paddingY: 1.8,
      }}
      position="static"
    >
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          component={RouterLink}
          aria-label="Home page"
          to="/"
          sx={{
            textDecoration: "none",
            color: (theme) =>
              theme.palette.getContrastText(theme.palette.primary.main),
          }}
        >
          <Box
            sx={{
              width: "60px",
            }}
          >
            <Box
              sx={{
                width: "100%",
              }}
              component="img"
              alt="Messaging App Logo"
              src="/messaging-app-logo.png"
            />
          </Box>
          <Box>
            <Typography variant="h6" component="h2">
              Messaging App
            </Typography>
          </Box>
        </Stack>
        {headerContent}
      </Stack>
    </AppBar>
  );
}

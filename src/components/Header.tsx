import { useRef, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link as RouterLink, NavLink } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import Notifications from "./Notifications";

export default function Header() {
  const user = useAppSelector(selectUser);
  const [open, setOpen] = useState(false);
  const anchorElement = useRef<HTMLButtonElement>(null);

  let headerContent: React.ReactElement;

  const handleMenuOpen = () => {
    setOpen(true);
  };

  const handleMenuClose = () => {
    setOpen(false);
  };

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
    headerContent = (
      <>
        <IconButton
          ref={anchorElement}
          onClick={handleMenuOpen}
          sx={{
            color: "#fff",
          }}
        >
          <NotificationsIcon
            titleAccess="Show notifications"
            fontSize="large"
          />
        </IconButton>
        {anchorElement.current && (
          <Notifications
            onClose={handleMenuClose}
            open={open}
            anchorElement={anchorElement.current}
          />
        )}
      </>
    );
  }

  return (
    <AppBar
      color="primary"
      sx={{
        paddingX: 4,
        paddingY: 1.8,
      }}
      position="sticky"
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

import { AppBar, Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <AppBar
      color="primary"
      sx={{
        padding: "20px",
      }}
    >
      <Typography component="h2">Messaging App</Typography>
      <Box component="img" alt="Messaging App Logo" />
    </AppBar>
  );
}

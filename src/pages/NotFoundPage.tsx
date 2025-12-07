import { Box, Typography } from "@mui/material";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <Box component="main">
      <Typography variant="h1">404 Not Found</Typography>
      <Typography>
        Click <Link to="/">here</Link> to return to Home page
      </Typography>
    </Box>
  );
}

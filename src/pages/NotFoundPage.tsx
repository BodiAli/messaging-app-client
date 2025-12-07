import { Box, Grid, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router";

export default function NotFoundPage() {
  return (
    <Box
      component="main"
      sx={{
        paddingTop: 8,
      }}
    >
      <Grid container direction={"column"} alignItems={"center"} spacing={3}>
        <Grid>
          <Typography fontWeight={400} variant="h1" color="error.dark">
            404 Not Found
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="h5" component={"p"}>
            Click{" "}
            <Link component={RouterLink} to="/">
              here
            </Link>{" "}
            to return to Home page
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

import { Box, Button, Stack, Typography } from "@mui/material";
import { useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "Unknown error";
  }

  return (
    <Box
      component={"main"}
      sx={{
        marginTop: 5,
      }}
    >
      <Stack alignItems={"center"} gap={4}>
        <Typography variant="h3" component={"p"} textAlign={"center"}>
          Unexpected error occurred
        </Typography>
        <Typography fontSize={"2rem"} color="error">
          {errorMessage}
        </Typography>
        <Button variant="contained" sx={{ fontSize: "1rem" }}>
          Reload
        </Button>
      </Stack>
    </Box>
  );
}

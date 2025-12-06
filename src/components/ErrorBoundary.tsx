import { Box, Button, Stack, Typography } from "@mui/material";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
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
        <Typography variant="h3" component={"h1"} textAlign={"center"}>
          Unexpected error occurred
        </Typography>
        <Typography fontSize={"2rem"} color="error">
          {errorMessage}
        </Typography>
        <Button
          variant="contained"
          sx={{ fontSize: "1rem" }}
          onClick={() => {
            void navigate(-1);
          }}
        >
          Go back
        </Button>
      </Stack>
    </Box>
  );
}

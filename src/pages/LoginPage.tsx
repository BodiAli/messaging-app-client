import { Navigate, useNavigate } from "react-router";
import { Box, Button, List, TextField, Typography } from "@mui/material";
import { type FormEvent, type ReactElement } from "react";
import {
  selectUser,
  useLoginAsGuestMutation,
  useLoginMutation,
} from "@/slices/authSlice";
import { useAppSelector } from "@/app/hooks";
import handleError from "@/utils/handleError";

interface LoginFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface LoginFormWithElements extends HTMLFormElement {
  readonly elements: LoginFormFields;
}

export default function LoginPage() {
  const [loginAsGuest, loginState] = useLoginAsGuestMutation();
  const [login, guestState] = useLoginMutation();
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  const error = loginState.error ?? guestState.error;
  const isLoading = loginState.isLoading || guestState.isLoading;

  if (user) {
    return <Navigate to="/" replace />;
  }

  let errorsList: ReactElement[] | undefined;

  if (error) {
    errorsList = handleError(error);
  }

  const handleLogin = (e: FormEvent<LoginFormWithElements>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const usernameValue = form.elements.username.value;
    const passwordValue = form.elements.password.value;

    const asyncHandler = async () => {
      try {
        await login({
          password: passwordValue,
          username: usernameValue,
        }).unwrap();

        void navigate("/");
      } catch {
        // empty
      }
    };
    void asyncHandler();
  };

  return (
    <Box
      component="main"
      sx={{
        paddingY: 4,
        display: "grid",
        gridTemplateColumns: "1fr",
        justifyItems: "center",
        gap: 4,
      }}
    >
      <Typography variant="h2" component="h1" align="center">
        Log in to your account
      </Typography>
      <Box
        component="form"
        aria-label="Login form"
        onSubmit={handleLogin}
        sx={{
          width: "60%",
          backgroundColor: "#efefef9c",
          padding: 4,
          borderRadius: "4px",
          boxShadow: "0 0 10px #ccc",
        }}
      >
        {error && (
          <List
            sx={{
              listStyleType: "disc",
              listStylePosition: "inside",
              color: (theme) => theme.palette.error.main,
            }}
          >
            {errorsList}
          </List>
        )}
        <Box
          component="div"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 2,
          }}
        >
          <TextField
            required
            label="Username"
            name="username"
            autoComplete="username"
            sx={{
              backgroundColor: "#ffffff71",
              "& .MuiInputLabel-root": {
                color: "#000000a9",
              },
            }}
          />
          <TextField
            required
            label="Password"
            type="password"
            name="password"
            sx={{
              backgroundColor: "#ffffff71",
              "& .MuiInputLabel-root": {
                color: "#000000a9",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              flexDirection: "column",
            }}
          >
            <Button
              sx={{
                justifySelf: "center",
                paddingX: 5,
                width: "25%",
              }}
              type="submit"
              loading={isLoading}
              variant="contained"
            >
              Log in
            </Button>
            <Button
              sx={{
                justifySelf: "center",
                paddingX: 5,
                width: "25%",
                backgroundColor: (theme) => theme.palette.secondary.dark,
              }}
              type="button"
              loading={isLoading}
              variant="contained"
              onClick={() => {
                void loginAsGuest(undefined);
              }}
            >
              Continue as a guest
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

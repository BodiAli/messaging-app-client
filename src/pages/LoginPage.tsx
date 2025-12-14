import { Navigate, useNavigate } from "react-router";
import {
  Box,
  Button,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import {
  isClientError,
  isServerError,
  type apiClientError,
} from "@/types/apiResponseTypes";
import { selectUser, useLoginMutation } from "@/slices/authSlice";
import { useAppSelector } from "@/app/hooks";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

interface LoginFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface LoginFormWithElements extends HTMLFormElement {
  readonly elements: LoginFormFields;
}

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [clientErrors, setClientErrors] = useState<apiClientError["errors"]>(
    [],
  );
  const [fatalError, setFatalError] = useState<string | null>(null);
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (fatalError) {
    throw new Error(fatalError);
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
      } catch (error) {
        if (isFetchBaseQueryError(error)) {
          if (typeof error.status === "number") {
            if (isClientError(error.data)) {
              setClientErrors(error.data.errors);
              return;
            } else if (isServerError(error.data)) {
              setFatalError(error.data.error.message);
              return;
            }
          } else {
            setFatalError(error.error);
            return;
          }
        }
        setFatalError(String(error));
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
        {clientErrors.length > 0 && (
          <List
            sx={{
              listStyleType: "disc",
              listStylePosition: "inside",
              color: (theme) => theme.palette.error.main,
            }}
          >
            {clientErrors.map((error) => {
              return (
                <ListItem
                  key={error.message}
                  sx={{
                    display: "list-item",
                  }}
                >
                  {error.message}
                </ListItem>
              );
            })}
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
          <Button
            sx={{
              justifySelf: "center",
              paddingX: 5,
            }}
            type="submit"
            disabled={isLoading}
            variant="contained"
          >
            Log in
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

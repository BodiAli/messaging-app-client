import { Navigate, useNavigate } from "react-router";
import {
  Button,
  FormLabel,
  Input,
  List,
  ListItem,
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
    <main>
      <Typography variant="h2" component="h1" align="center">
        Log in to your account
      </Typography>
      <form aria-label="Login form" onSubmit={handleLogin}>
        <List>
          {clientErrors.map((error) => {
            return <ListItem key={error.message}>{error.message}</ListItem>;
          })}
        </List>
        <FormLabel>
          Username
          <Input name="username" required />
        </FormLabel>
        <FormLabel>
          Password
          <Input name="password" type="password" required />
        </FormLabel>
        <Button type="submit" disabled={isLoading}>
          Log in
        </Button>
      </form>
    </main>
  );
}

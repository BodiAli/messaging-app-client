import type React from "react";
import { useLoginMutation } from "@/slices/authSlice";
import { useNavigate } from "react-router";
import { Button, FormLabel, Input, Typography } from "@mui/material";

export default function LoginPage() {
  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <main>
      <Typography variant="h2" component="h1" align="center">
        Log in to your account
      </Typography>
      <form aria-label="Login form">
        <FormLabel>
          Username
          <Input name="Username" />
        </FormLabel>
        <FormLabel>
          Password
          <Input name="Username" type="password" />
        </FormLabel>
        <Button type="submit">Log in</Button>
      </form>
    </main>
  );
}

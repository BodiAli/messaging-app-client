import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Box, Button, List, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignupSchema } from "@/libs/schemas";
import { useSignUpMutation } from "@/slices/authSlice";
import handleError from "@/utils/handleError";
import type { ReactElement } from "react";

type FormValues = z.infer<typeof UserSignupSchema>;

export default function SignupPage() {
  const [signUp, { isLoading, error }] = useSignUpMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UserSignupSchema),
    mode: "onBlur",
  });

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await signUp(data).unwrap();
      void navigate("/");
    } catch {
      // empty
    }
  };

  let errorsList: ReactElement[] | undefined;

  if (error) {
    errorsList = handleError(error);
  }

  return (
    <Box component="main">
      <Typography variant="h2" component="h1">
        Create a new account
      </Typography>
      <Box
        component="form"
        aria-label="Sign up form"
        onSubmit={handleSubmit(onSubmit)}
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
        <TextField
          type="text"
          label="Username"
          autoComplete="username"
          required
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
        <TextField
          type="password"
          label="Password"
          required
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          type="password"
          label="Confirm password"
          required
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" disabled={isLoading}>
          Create account
        </Button>
      </Box>
    </Box>
  );
}

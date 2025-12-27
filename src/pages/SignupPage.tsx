import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Box, Button, List, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignupSchema } from "@/libs/schemas";
import { useSignUpMutation } from "@/slices/authSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import handleClientError from "@/utils/handleClientError";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
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
    if (isFetchBaseQueryError(error) && isClientError(error.data)) {
      errorsList = handleClientError(error.data);
    } else {
      handleUnexpectedError(error);
    }
  }

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
      <Typography
        variant="h2"
        component="h1"
        sx={{
          textAlign: "center",
        }}
      >
        Create a new account
      </Typography>
      <Box
        component="form"
        aria-label="Sign up form"
        onSubmit={handleSubmit(onSubmit)}
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
            type="text"
            label="Username"
            autoComplete="username"
            required
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{
              "& .MuiInputLabel-root": {
                color: "#000000a9",
              },
            }}
            slotProps={{
              htmlInput: {
                sx: {
                  backgroundColor: "#ffffff71",
                },
              },
            }}
          />
          <TextField
            type="password"
            label="Password"
            required
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              "& .MuiInputLabel-root": {
                color: "#000000a9",
              },
            }}
            slotProps={{
              htmlInput: {
                sx: {
                  backgroundColor: "#ffffff71",
                },
              },
            }}
          />
          <TextField
            type="password"
            label="Confirm password"
            required
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{
              "& .MuiInputLabel-root": {
                color: "#000000a9",
              },
            }}
            slotProps={{
              htmlInput: {
                sx: {
                  backgroundColor: "#ffffff71",
                },
              },
            }}
          />
          <Button
            type="submit"
            sx={{
              justifySelf: "center",
              paddingX: 5,
            }}
            variant="contained"
            loading={isLoading}
          >
            Create account
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

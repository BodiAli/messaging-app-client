import { useForm, type SubmitHandler } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignupSchema } from "@/libs/schemas";

type FormValues = z.infer<typeof UserSignupSchema>;

export default function SignupPage() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UserSignupSchema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

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
        <Button type="submit">Create account</Button>
      </Box>
    </Box>
  );
}

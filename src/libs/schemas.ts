import { z } from "zod";

export const UserSignupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .nonempty("Username cannot be empty.")
      .max(100, "Username cannot exceed 100 characters."),
    password: z.string().min(5, "Password must be at least 5 characters."),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      error: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

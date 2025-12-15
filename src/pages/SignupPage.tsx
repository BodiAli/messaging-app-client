import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: {
      validation: {
        empty: "Username cannot be empty.",
        tooLong: "Username cannot exceed 100 characters.",
      },
      value: "kokowawa",
    },
  });

  const [currentError, setCurrentError] = useState("");

  return (
    <Box component="main">
      <Typography variant="h2" component="h1">
        Create a new account
      </Typography>
      <Box component="form" aria-label="Sign up form">
        <TextField
          onChange={(e) => {
            console.log(formData);

            setFormData({
              ...formData,
              username: { ...formData.username, value: e.currentTarget.value },
            });
          }}
          onBlur={(e) => {
            const value = e.currentTarget.value;

            if (value.trim().length === 0) {
              setCurrentError(formData.username.validation.empty);
            } else {
              setCurrentError("");
            }
          }}
          error={!!currentError}
          helperText={currentError}
          type="text"
          label="Username"
          required
          value={formData.username.value}
        />
        <TextField type="password" label="Password" required />
        <TextField type="password" label="Confirm password" required />
        <Button type="submit">Create account</Button>
      </Box>
    </Box>
  );
}

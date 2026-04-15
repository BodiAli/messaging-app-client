import { Box, Button, List, TextField, Typography } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSnackbar } from "notistack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useEffect, type ReactElement } from "react";
import { GroupSchema } from "@/libs/schemas";
import { useCreateGroupMutation } from "@/slices/groupsSlice";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
import handleClientError from "@/utils/handleClientError";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import type { z } from "zod";

type FormFields = z.infer<typeof GroupSchema>;

export default function GroupsPageIndex() {
  const [createGroup, { isError, error, isLoading }] = useCreateGroupMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(GroupSchema),
  });
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (currentUser.isGuest) {
      enqueueSnackbar("You must have an account to complete this request.", {
        variant: "error",
      });
      void navigate("/");
    }
  }, [currentUser.isGuest, enqueueSnackbar, navigate]);

  let errorsList: ReactElement[] | null = null;

  if (isError) {
    if (isFetchBaseQueryError(error) && isClientError(error.data)) {
      errorsList = handleClientError(error.data);
    } else {
      handleUnexpectedError(error);
    }
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    await createGroup(data.groupName);
    reset();
    enqueueSnackbar(`${data.groupName} was created successfully`, {
      variant: "success",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        marginTop: 3,
        paddingX: 8,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography variant="h2" component={"h1"}>
          Create a new group
        </Typography>
      </Box>
      <Box
        component={"form"}
        aria-label="create new group"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {errorsList && (
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
          label="Group name"
          required
          {...register("groupName")}
          error={!!errors.groupName}
          helperText={errors.groupName?.message}
          sx={{
            flex: 3,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000",
            },
          }}
          slotProps={{
            inputLabel: {
              sx: {
                color: "#000",
              },
            },
          }}
        />
        <Button
          type="submit"
          loading={isLoading}
          variant="contained"
          sx={{
            alignSelf: "start",
            flex: 1,
            backgroundColor: (theme) => theme.palette.success.dark,
            paddingY: 2,
          }}
        >
          Create group
        </Button>
      </Box>
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined");
  }
}

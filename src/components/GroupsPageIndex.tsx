import { Box, Button, List, TextField, Typography } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSnackbar } from "notistack";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupSchema } from "@/libs/schemas";
import { useCreateGroupMutation } from "@/slices/groupsSlice";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
import handleClientError from "@/utils/handleClientError";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import type { z } from "zod";
import type { ReactElement } from "react";

type FormFields = z.infer<typeof GroupSchema>;

export default function GroupsPageIndex() {
  const [createGroup, { isError, error, isLoading }] = useCreateGroupMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(GroupSchema),
  });
  const { enqueueSnackbar } = useSnackbar();

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
    enqueueSnackbar(`${data.groupName} was created successfully`, {
      variant: "success",
    });
  };

  return (
    <Box>
      <Typography variant="h1">Create a new group</Typography>
      <Box
        component={"form"}
        aria-label="create new group"
        onSubmit={handleSubmit(onSubmit)}
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
        />
        <Button type="submit" loading={isLoading}>
          Create group
        </Button>
      </Box>
    </Box>
  );
}

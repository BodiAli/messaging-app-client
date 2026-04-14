import { useState, type ChangeEvent } from "react";
import { Box, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useAppSelector } from "@/app/hooks";
import UsersAvatar from "@/components/UsersAvatar";
import { selectUser } from "@/slices/authSlice";
import { useUpdateProfilePictureMutation } from "@/slices/profileSlice";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";

export default function ProfilePage() {
  const [fatalError, setFatalError] = useState<null | string>(null);
  const [updateProfilePicture, { isLoading: isUpdatingProfilePicture }] =
    useUpdateProfilePictureMutation();
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

  if (fatalError) {
    throw new Error(fatalError);
  }

  const handleUpdateProfilePicture = async (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    assert(e.currentTarget.files);
    const files = e.currentTarget.files;
    const isFilePresent = files.length !== 0;

    try {
      if (isFilePresent) {
        assert(files[0]);

        const formData = new FormData();
        formData.set("profileImage", files[0]);
        await updateProfilePicture(formData).unwrap();
      }
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isServerError(error.data)) {
          setFatalError(error.data.error);
          return;
        }
        if (isClientError(error.data)) {
          error.data.errors.forEach((error) => {
            enqueueSnackbar(error.message, {
              variant: "error",
            });
          });
          return;
        }

        if (Error.isError(error)) {
          setFatalError(error.message);
        }
      }
    }
  };

  return (
    <Box>
      <Box>
        <UsersAvatar
          imageUrl={currentUser.imageUrl}
          username={currentUser.username}
        />
      </Box>
      <Box>
        <Typography variant="h1">{currentUser.username}</Typography>
      </Box>

      <label>
        Edit profile picture
        <input
          disabled={isUpdatingProfilePicture}
          onChange={handleUpdateProfilePicture}
          type="file"
          name="profileImage"
        />
      </label>
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined.");
  }
}

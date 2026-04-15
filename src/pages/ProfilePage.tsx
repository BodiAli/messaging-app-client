import { useState, type ChangeEvent } from "react";
import { Link as RouterLink } from "react-router";
import {
  Avatar,
  Box,
  Input,
  InputLabel,
  Link,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import styled from "@emotion/styled";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import { useUpdateProfilePictureMutation } from "@/slices/profileSlice";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";
import { useGetGroupsQuery } from "@/slices/groupsSlice";
import Loader from "@/components/Loader/Loader";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

const CustomAvatar = styled(Avatar)(() => {
  return {
    width: "10rem",
    height: "10rem",
  };
});

export default function ProfilePage() {
  const [fatalError, setFatalError] = useState<null | string>(null);
  const [updateProfilePicture, { isLoading: isUpdatingProfilePicture }] =
    useUpdateProfilePictureMutation();
  const {
    data: { groups } = { groups: [] },
    isLoading: isGettingUserGroupsLoading,
    isError: isGettingUserGroupsError,
    error: gettingUserGroupsError,
  } = useGetGroupsQuery(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

  if (fatalError) {
    throw new Error(fatalError);
  }

  if (isGettingUserGroupsError) {
    handleUnexpectedError(gettingUserGroupsError);
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
        enqueueSnackbar("Profile picture updated.", { variant: "success" });
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

  const userAvatar = currentUser.imageUrl ? (
    <CustomAvatar
      src={currentUser.imageUrl}
      alt={`${currentUser.username}'s profile picture`}
    />
  ) : (
    <CustomAvatar title={`${currentUser.username} no profile picture`} />
  );

  return (
    <Box
      sx={{
        flex: 1,
        paddingY: "2rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          paddingX: "2rem",
          justifyContent: "center",
        }}
      >
        <Box>
          <Typography variant="h1">{currentUser.username}</Typography>
        </Box>
        <Box>
          <InputLabel
            component={"label"}
            sx={{
              textAlign: "center",
            }}
          >
            {userAvatar}
            Edit profile picture
            <Input
              disabled={isUpdatingProfilePicture}
              onChange={handleUpdateProfilePicture}
              type="file"
              name="profileImage"
              sx={{
                width: 0,
              }}
            />
          </InputLabel>
        </Box>
      </Box>
      <Box
        sx={{
          marginTop: "3rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        <Typography variant="h2">Your Created Groups</Typography>
      </Box>
      {isGettingUserGroupsLoading ? (
        <Loader />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {groups
            .filter((group) => group.adminId === currentUser.id)
            .sort((a, b) => {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            })
            .map((group) => {
              return (
                <Link
                  sx={{
                    backgroundColor: "#ffffff73",
                    padding: 3,
                    fontSize: "2rem",
                    textDecoration: "none",
                    transition: "background-color 200ms",
                    "&:hover": {
                      backgroundColor: "#ffffffa0",
                    },
                  }}
                  component={RouterLink}
                  key={group.id}
                  to={`/groups/${group.id}/details`}
                >
                  {group.name}
                </Link>
              );
            })}
        </Box>
      )}
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined.");
  }
}

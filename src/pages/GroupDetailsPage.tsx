import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useGetGroupDetailsQuery,
  useSendGroupInviteMutation,
  useUpdateGroupNameMutation,
} from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
} from "@/types/apiResponseTypes";
import GroupDetailsHeader from "@/components/GroupDetailsHeader";
import Loader from "@/components/Loader/Loader";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";
import { useGetFriendsQuery } from "@/slices/friendsSlice";

export default function GroupDetailsPage() {
  const [fatalError, setFatalError] = useState<string | null>(null);
  const { groupId } = useParams<"groupId">();
  assert(groupId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    data: userFriends,
    isError: isUserFriendsError,
    isLoading: isUserFriendsLoading,
    error: userFriendsError,
  } = useGetFriendsQuery(undefined);
  const {
    data: groupDetails,
    isError: isGroupDetailsError,
    error: groupDetailsError,
    isLoading: isGroupDetailsLoading,
  } = useGetGroupDetailsQuery(groupId);
  const [sendGroupInvite, { isLoading: isSendGroupInviteLoading }] =
    useSendGroupInviteMutation();
  const [updateGroupName, { isLoading: isUpdateGroupNameLoading }] =
    useUpdateGroupNameMutation();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

  const handleUpdateName = async (groupName: string) => {
    try {
      await updateGroupName({ groupName, groupId }).unwrap();
      enqueueSnackbar("Group name updated successfully.", {
        variant: "success",
      });
    } catch (error) {
      if (isFetchBaseQueryError(error) && isClientError(error.data)) {
        error.data.errors.forEach((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
        return;
      }
      if (isFetchBaseQueryError(error) && isServerError(error.data)) {
        setFatalError(error.data.error);
        return;
      }
      if (Error.isError(error)) {
        setFatalError(error.message);
      }
    }
  };

  const handleGroupInvite = async (friendIds: string[]) => {
    try {
      await sendGroupInvite({ friendIds, groupId }).unwrap();
      enqueueSnackbar("Group invitation sent.", { variant: "success" });
    } catch (error) {
      if (isFetchBaseQueryError(error) && isClientError(error.data)) {
        error.data.errors.forEach((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
        return;
      }
      if (isFetchBaseQueryError(error) && isServerError(error.data)) {
        setFatalError(error.data.error);
        return;
      }

      if (Error.isError(error)) {
        setFatalError(error.message);
      }
    }
  };

  useEffect(() => {
    if (isGroupDetailsError) {
      if (
        isFetchBaseQueryError(groupDetailsError) &&
        isClientError(groupDetailsError.data)
      ) {
        groupDetailsError.data.errors.forEach((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
        void navigate("/");
      } else {
        handleUnexpectedError(groupDetailsError);
      }
    }
  }, [isGroupDetailsError, groupDetailsError, navigate, enqueueSnackbar]);

  if (fatalError) {
    throw new Error(fatalError);
  }

  if (isUserFriendsError) {
    handleUnexpectedError(userFriendsError);
  }

  if (
    isGroupDetailsLoading ||
    !groupDetails ||
    isUserFriendsLoading ||
    !userFriends
  ) {
    return <Loader />;
  }

  const {
    group: { users, ...group },
  } = groupDetails;

  const nonMemberUsers = userFriends.friends.filter(
    (_friend, index) => !users[index],
  );

  return (
    <Box>
      <GroupDetailsHeader
        group={group}
        currentUserId={currentUser.id}
        nonMemberUsers={nonMemberUsers}
        onGroupInvite={handleGroupInvite}
        isSendingInvite={isSendGroupInviteLoading}
        onUpdateGroupName={handleUpdateName}
        isUpdatingName={isUpdateGroupNameLoading}
      />
      ;
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined");
  }
}

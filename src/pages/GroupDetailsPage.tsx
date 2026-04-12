import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useDeleteGroupMutation,
  useGetGroupDetailsQuery,
  useRemoveMemberMutation,
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
import GroupMembers from "@/components/GroupMembers";

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
  const [deleteGroup, { isLoading: isDeleteGroupLoading }] =
    useDeleteGroupMutation();
  const [removeMember, { isLoading: isRemoveMemberLoading }] =
    useRemoveMemberMutation();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

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

  if (fatalError) {
    throw new Error(fatalError);
  }

  if (isUserFriendsError) {
    handleUnexpectedError(userFriendsError);
  }

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

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(groupId).unwrap();
      enqueueSnackbar("Group deleted successfully.", { variant: "success" });
      void navigate("/groups", {
        replace: true,
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

  const handleRemoveMember = async (memberId: string) => {
    const currentMember = users.find((member) => member.id === memberId);
    assert(currentMember);
    try {
      await removeMember({ memberId: currentMember.id, groupId }).unwrap();
      enqueueSnackbar(`${currentMember.username} removed.`, {
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

  const nonMemberUsers = userFriends.friends
    .filter((_friend, index) => !users[index])
    .sort((a, b) => {
      if (a.username > b.username) {
        return 1;
      }
      if (a.username < b.username) {
        return -1;
      }
      return 0;
    });

  return (
    <Box
      sx={{
        flex: 1,
        padding: 3,
      }}
    >
      <GroupDetailsHeader
        group={group}
        isGroupAdmin={currentUser.id === group.admin.id}
        onUpdateGroupName={handleUpdateName}
        onGroupInvite={handleGroupInvite}
        onDeleteGroup={handleDeleteGroup}
        nonMemberUsers={nonMemberUsers}
        isUpdatingName={isUpdateGroupNameLoading}
        isSendingInvite={isSendGroupInviteLoading}
        isDeletingGroup={isDeleteGroupLoading}
      />
      <GroupMembers
        groupMembers={users}
        isGroupAdmin={currentUser.id === group.admin.id}
        onRemoveMember={handleRemoveMember}
        isRemovingMember={isRemoveMemberLoading}
      />
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined");
  }
}

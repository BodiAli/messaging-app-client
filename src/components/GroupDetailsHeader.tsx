import { useState, type ReactElement } from "react";
import {
  Typography,
  Box,
  Autocomplete,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import formatDate from "@/utils/formatDate";
import UsersAvatar from "./UsersAvatar";
import type { GroupDetails, User } from "@/types/modelsType";

export default function GroupDetailsHeader({
  group,
  nonMemberUsers,
  currentUserId,
  onGroupInvite,
  onDeleteGroup,
  isSendingInvite,
  isDeletingGroup,
  isUpdatingName,
  onUpdateGroupName,
}: {
  group: Omit<GroupDetails["group"], "users">;
  nonMemberUsers: Pick<User, "id" | "username" | "imageUrl">[];
  currentUserId: string;
  isSendingInvite: boolean;
  isDeletingGroup: boolean;
  isUpdatingName: boolean;
  onGroupInvite: (friendIds: string[]) => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  onUpdateGroupName: (groupName: string) => Promise<void>;
}) {
  const [groupName, setGroupName] = useState(group.name);
  const [friendsIds, setFriendsIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateNameDialogOpen, setUpdateNameDialogOpen] = useState(false);

  let groupActions: ReactElement | null = null;

  const isGroupAdmin = currentUserId === group.admin.id;

  if (isGroupAdmin) {
    const handleDeleteDialogOpen = () => {
      setDeleteDialogOpen(true);
    };
    const handleDeleteDialogClose = () => {
      setDeleteDialogOpen(false);
    };
    groupActions = (
      <>
        <Autocomplete
          multiple
          options={nonMemberUsers}
          disabled={isSendingInvite}
          renderInput={(params) => {
            return <TextField {...params} label="Invite friends" />;
          }}
          getOptionLabel={(option) => option.username}
          getOptionKey={(option) => option.id}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;

            const SelectionIcon = selected ? CheckBox : CheckBoxOutlineBlank;

            return (
              <Box key={key} {...optionProps} component={"li"}>
                <SelectionIcon />
                <UsersAvatar
                  imageUrl={option.imageUrl}
                  username={option.username}
                />

                {option.username}
              </Box>
            );
          }}
          disableCloseOnSelect
          onChange={(_e, friends) => {
            const ids = friends.map((friend) => friend.id);
            setFriendsIds(ids);
          }}
        ></Autocomplete>
        <Button
          disabled={friendsIds.length === 0}
          onClick={() => {
            void onGroupInvite(friendsIds);
          }}
        >
          Send Invite
        </Button>
        <Button onClick={handleDeleteDialogOpen} loading={isDeletingGroup}>
          Delete Group
        </Button>
        <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>Are you sure you want to delete this group?</DialogTitle>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
            <Button
              onClick={() => {
                handleDeleteDialogClose();
                void onDeleteGroup();
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  const updateGroupName: () => ReactElement = () => {
    const handleUpdateNameDialogOpen = () => {
      setUpdateNameDialogOpen(true);
    };

    const handleUpdateNameDialogClose = () => {
      setUpdateNameDialogOpen(false);
    };
    return (
      <Box>
        <TextField
          value={groupName}
          onChange={(e) => {
            setGroupName(e.currentTarget.value);
          }}
        />
        <Button loading={isUpdatingName} onClick={handleUpdateNameDialogOpen}>
          Update Name
        </Button>
        <Dialog open={updateNameDialogOpen}>
          <DialogTitle>
            Are you sure you want to update this group’s name?
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleUpdateNameDialogClose}>Cancel</Button>
            <Button
              onClick={() => {
                handleUpdateNameDialogClose();
                void onUpdateGroupName(groupName);
              }}
            >
              Confirm
            </Button>
          </DialogActions>{" "}
        </Dialog>
      </Box>
    );
  };
  return (
    <Box>
      {isGroupAdmin ? (
        updateGroupName()
      ) : (
        <Typography variant="h1">{group.name}</Typography>
      )}

      <Typography>
        Created at <Box component={"time"}>{formatDate(group.createdAt)}</Box>
      </Typography>
      <UsersAvatar
        imageUrl={group.admin.imageUrl}
        username={group.admin.username}
      />
      <Typography>Created by: {group.admin.username}</Typography>

      {groupActions}
    </Box>
  );
}

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
import type { GroupChat, User } from "@/types/modelsType";

export default function GroupDetailsHeader({
  group,
  nonMemberUsers,
  currentUserId,
  onGroupInvite,
  onDeleteGroup,
}: {
  group: GroupChat & {
    admin: Pick<User, "id" | "username" | "imageUrl">;
  };
  nonMemberUsers: Pick<User, "id" | "username" | "imageUrl">[];
  currentUserId: string;
  onGroupInvite: (friendIds: string[]) => Promise<void>;
  onDeleteGroup: () => Promise<void>;
}) {
  const [friendsIds, setFriendsIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  let groupActions: ReactElement | null = null;
  if (currentUserId === group.adminId) {
    const handleDialogOpen = () => {
      setDialogOpen(true);
    };
    const handleDialogClose = () => {
      setDialogOpen(false);
    };

    groupActions = (
      <>
        <Autocomplete
          multiple
          options={nonMemberUsers}
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
        <Button onClick={handleDialogOpen}>Delete Group</Button>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Are you sure you want to delete this group?</DialogTitle>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={() => {
                handleDialogClose();
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

  return (
    <Box>
      <Typography variant="h1">{group.name}</Typography>
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

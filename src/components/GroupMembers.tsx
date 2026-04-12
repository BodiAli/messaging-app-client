import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
} from "@mui/material";
import UsersAvatar from "./UsersAvatar";
import type { User } from "@/types/modelsType";

export default function GroupMembers({
  groupMembers,
  isGroupAdmin,
  isRemovingMember,
  onRemoveMember,
}: {
  isGroupAdmin: boolean;
  groupMembers: Pick<User, "id" | "imageUrl" | "username">[];
  isRemovingMember: boolean;
  onRemoveMember: (memberId: string) => Promise<void>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Pick<
    User,
    "id" | "imageUrl" | "username"
  > | null>(null);

  const handleDialogOpen = (
    currentUser: Pick<User, "id" | "imageUrl" | "username">,
  ) => {
    return () => {
      setCurrentMember(currentUser);
      setDialogOpen(true);
    };
  };
  const handleDialogClose = () => {
    return () => {
      setCurrentMember(null);
      setDialogOpen(false);
    };
  };

  const groupMembersCount = () => {
    if (groupMembers.length === 1) {
      return `${groupMembers.length.toString()} member`;
    }
    if (groupMembers.length === 0) {
      return "Group has no members.";
    }
    return `${groupMembers.length.toString()} members`;
  };

  return (
    <Box
      sx={{
        marginTop: "3rem",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "2rem",
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            paddingX: 3,
          }}
        >
          {groupMembersCount()}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {groupMembers.map((member) => {
          return (
            <Box
              key={member.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                backgroundColor: "#ffffff73",
                padding: 3,
              }}
            >
              <UsersAvatar
                imageUrl={member.imageUrl}
                username={member.username}
              />
              <Typography>{member.username}</Typography>
              {isGroupAdmin && (
                <Button
                  onClick={handleDialogOpen(member)}
                  loading={isRemovingMember}
                  sx={{
                    marginLeft: "auto",
                    padding: 2,
                  }}
                  color="error"
                >
                  Remove Member
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
      {currentMember && (
        <Dialog open={dialogOpen} onClose={handleDialogClose()}>
          <DialogTitle>
            Are you sure you want to remove {currentMember.username}?
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleDialogClose()}>Cancel</Button>
            <Button
              onClick={() => {
                handleDialogClose()();
                void onRemoveMember(currentMember.id);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

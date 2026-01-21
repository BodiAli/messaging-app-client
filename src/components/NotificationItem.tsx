import {
  Avatar,
  Box,
  Button,
  MenuItem,
  Stack,
  Typography,
  type ButtonProps,
  type StackProps,
} from "@mui/material";
import formatDate from "@/utils/formatDate";
import type { UserNotifications } from "@/types/userNotifications";
import type { JSX } from "react";

type Flatten<Type> = Type extends (infer Item)[] ? Item : Type;

const StyledStack = (props: StackProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 1,
      }}
    >
      {props.children}
    </Stack>
  );
};

const StyledNotificationStack = (props: StackProps) => {
  return <Stack gap={2}>{props.children}</Stack>;
};

const StyledButtonStack = (props: StackProps) => {
  return (
    <Stack direction="row" gap={1}>
      {props.children}
    </Stack>
  );
};

const StyledButton = (props: ButtonProps) => {
  return (
    <Button variant="outlined" {...props}>
      {props.children}
    </Button>
  );
};

export default function NotificationItem({
  notification,
}: {
  notification: Flatten<UserNotifications["notifications"]>;
}) {
  const renderNotificationContent = () => {
    let avatar: JSX.Element;
    let notificationContent: JSX.Element;

    if (notification.type === "GROUP_INVITATION") {
      avatar = notification.groupChatInvitation.admin.imageUrl ? (
        <Avatar
          src={notification.groupChatInvitation.admin.imageUrl}
          alt={`${notification.groupChatInvitation.admin.username}'s profile picture`}
        />
      ) : (
        <Avatar
          title={`${notification.groupChatInvitation.admin.username} no profile picture`}
        />
      );

      notificationContent = (
        <StyledNotificationStack>
          <StyledStack>
            {avatar}
            <Typography>
              {notification.groupChatInvitation.admin.username} invited you to
              join {notification.groupChatInvitation.name}
            </Typography>
          </StyledStack>
          <StyledButtonStack>
            <StyledButton
              sx={{
                flex: 1,
                color: (theme) => theme.palette.success.dark,
              }}
            >
              Accept
            </StyledButton>
            <StyledButton
              sx={{
                flex: 1,
                color: (theme) => theme.palette.error.main,
              }}
            >
              Decline
            </StyledButton>
          </StyledButtonStack>
        </StyledNotificationStack>
      );
    } else {
      avatar = notification.friendRequest.sender.imageUrl ? (
        <Avatar
          src={notification.friendRequest.sender.imageUrl}
          alt={`${notification.friendRequest.sender.username}'s profile picture`}
        />
      ) : (
        <Avatar
          title={`${notification.friendRequest.sender.username} no profile picture`}
        />
      );
      notificationContent = (
        <StyledNotificationStack>
          <StyledStack>
            {avatar}
            <Typography>
              {notification.friendRequest.sender.username} sent you a friend
              request
            </Typography>
          </StyledStack>
          <StyledButtonStack>
            <StyledButton
              sx={{
                flex: 1,
                color: (theme) => theme.palette.success.dark,
              }}
            >
              Accept
            </StyledButton>
            <StyledButton
              sx={{
                flex: 1,
                color: (theme) => theme.palette.error.main,
              }}
            >
              Decline
            </StyledButton>
          </StyledButtonStack>
        </StyledNotificationStack>
      );
    }

    return notificationContent;
  };

  return (
    <MenuItem
      divider
      disableRipple
      sx={{
        cursor: "initial",
        display: "flex",
        flexDirection: "column",
        alignItems: "initial",
        padding: 2,
        "&:hover": {
          backgroundColor: "transparent",
        },
      }}
    >
      <Box component="time" sx={{ alignSelf: "end" }}>
        {formatDate(notification.createdAt)}
      </Box>
      {renderNotificationContent()}
    </MenuItem>
  );
}

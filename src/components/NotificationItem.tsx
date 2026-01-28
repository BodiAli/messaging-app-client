import {
  Avatar,
  Box,
  Button,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  type ButtonProps,
  type SkeletonProps,
  type StackProps,
} from "@mui/material";
import formatDate from "@/utils/formatDate";
import type { UserNotifications } from "@/types/userNotifications";

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

interface NotificationLoading {
  isLoading: true;
  notification: undefined;
  onDeclineClick: undefined;
  onAcceptClick: undefined;
}

type NotificationType = "GROUP_INVITATION" | "FRIEND_REQUEST";

interface NotificationNotLoading {
  isLoading: false;
  notification: Flatten<UserNotifications["notifications"]>;
  onDeclineClick: (id: string, type: NotificationType) => () => Promise<void>;
  onAcceptClick: (id: string, type: NotificationType) => () => Promise<void>;
}

type NotificationItemProps = (NotificationLoading | NotificationNotLoading) & {
  mutationLoading: boolean;
};

const SkeletonWithTestId = (props: SkeletonProps) => {
  return (
    <Skeleton {...props} data-testid="skeleton">
      {props.children}
    </Skeleton>
  );
};

const skeletonWidth = 170;

export default function NotificationItem({
  isLoading,
  notification,
  onDeclineClick,
  onAcceptClick,
  mutationLoading,
}: NotificationItemProps) {
  if (isLoading) {
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
        <SkeletonWithTestId
          sx={{ alignSelf: "end", width: "40%" }}
        ></SkeletonWithTestId>

        <StyledNotificationStack>
          <StyledStack>
            <SkeletonWithTestId variant="circular">
              <Avatar />
            </SkeletonWithTestId>
            <SkeletonWithTestId width="100%">
              <Typography>.</Typography>
            </SkeletonWithTestId>
          </StyledStack>
          <StyledButtonStack>
            <SkeletonWithTestId
              data-testid="123"
              width={skeletonWidth}
              sx={{ paddingTop: "36px" }}
            />
            <SkeletonWithTestId width={skeletonWidth} />
          </StyledButtonStack>
        </StyledNotificationStack>
      </MenuItem>
    );
  }

  const notificationData =
    notification.type === "GROUP_INVITATION"
      ? {
          message: `${notification.groupChatInvitation.admin.username} invited you to
                join ${notification.groupChatInvitation.name}`,
          imageUrl: notification.groupChatInvitation.admin.imageUrl,
          username: notification.groupChatInvitation.admin.username,
          id: notification.groupChatInvitation.id,
        }
      : {
          message: `${notification.friendRequest.sender.username} sent you a friend
          request`,
          imageUrl: notification.friendRequest.sender.imageUrl,
          username: notification.friendRequest.sender.username,
          id: notification.friendRequest.id,
        };

  return (
    <MenuItem
      disabled={mutationLoading}
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
      <StyledNotificationStack>
        <StyledStack>
          <NotificationAvatar
            imageUrl={notificationData.imageUrl}
            username={notificationData.username}
          />
          <Typography>{notificationData.message}</Typography>
        </StyledStack>
        <StyledButtonStack>
          <StyledButton
            onClick={onAcceptClick(notificationData.id, notification.type)}
            sx={{
              flex: 1,
              color: (theme) => theme.palette.success.dark,
            }}
          >
            Accept
          </StyledButton>
          <StyledButton
            onClick={onDeclineClick(notificationData.id, notification.type)}
            sx={{
              flex: 1,
              color: (theme) => theme.palette.error.main,
            }}
          >
            Decline
          </StyledButton>
        </StyledButtonStack>
      </StyledNotificationStack>
    </MenuItem>
  );
}

function NotificationAvatar({
  imageUrl,
  username,
}: {
  imageUrl: null | string;
  username: string;
}) {
  return imageUrl ? (
    <Avatar src={imageUrl} alt={`${username}'s profile picture`} />
  ) : (
    <Avatar title={`${username} no profile picture`} />
  );
}

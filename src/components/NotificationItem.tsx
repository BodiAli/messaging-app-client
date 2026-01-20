import { Avatar, MenuItem } from "@mui/material";
import formatDate from "@/utils/formatDate";
import type { UserNotifications } from "@/types/userNotifications";
import type { JSX } from "react";

type Flatten<Type> = Type extends (infer Item)[] ? Item : Type;

export default function NotificationItem({
  notification,
}: {
  notification: Flatten<UserNotifications["notifications"]>;
}) {
  let notificationContent: JSX.Element;

  const renderAvatar = () => {
    let avatar: JSX.Element;

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
    }

    return avatar;
  };

  if (notification.type === "GROUP_INVITATION") {
    notificationContent = (
      <p>
        {notification.groupChatInvitation.admin.username} invited you to join{" "}
        {notification.groupChatInvitation.name}
      </p>
    );
  } else {
    notificationContent = (
      <p>
        {notification.friendRequest.sender.username} sent you a friend request
      </p>
    );
  }

  return (
    <MenuItem>
      <time>{formatDate(notification.createdAt)}</time>
      {notificationContent}
      {renderAvatar()}
    </MenuItem>
  );
}

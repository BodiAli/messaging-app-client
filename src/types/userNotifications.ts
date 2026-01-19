import type {
  Friendship,
  GroupChat,
  NotificationType,
  User,
} from "prismaTypes";

interface GroupInviteNotification {
  id: string;
  createdAt: Date;
  type: NotificationType;
  friendRequest: null;
  groupChatInvitation: Omit<GroupChat, "adminId"> & {
    admin: Pick<User, "username" | "imageUrl" | "id">;
  };
}

interface FriendRequestNotification {
  id: string;
  createdAt: Date;
  type: NotificationType;
  groupChatInvitation: null;
  friendRequest: Omit<Friendship, "senderId"> & {
    sender: Pick<User, "username" | "imageUrl" | "id">;
  };
}

export interface UserNotifications {
  notifications: (FriendRequestNotification | GroupInviteNotification)[];
}

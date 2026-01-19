import type { Friendship, GroupChat, User } from "prismaTypes";

interface GroupInviteNotification {
  id: string;
  createdAt: string;
  type: "GROUP_INVITATION";
  friendRequest: null;
  groupChatInvitation: Omit<GroupChat, "adminId" | "createdAt"> & {
    admin: Pick<User, "username" | "imageUrl" | "id">;
    createdAt: string;
  };
}

interface FriendRequestNotification {
  id: string;
  createdAt: string;
  type: "FRIEND_REQUEST";
  groupChatInvitation: null;
  friendRequest: Omit<Friendship, "senderId" | "createdAt"> & {
    sender: Pick<User, "username" | "imageUrl" | "id">;
    createdAt: string;
  };
}

export interface UserNotifications {
  notifications: (FriendRequestNotification | GroupInviteNotification)[];
}

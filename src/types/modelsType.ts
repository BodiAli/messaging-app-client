import type {
  User as PrismaUser,
  Message as PrismaMessage,
  FriendStatus,
  GroupChat as PrismaGroupChat,
} from "prismaTypes";

export interface User extends Omit<PrismaUser, "lastSeen" | "password"> {
  lastSeen: string;
}

export type Friend = Omit<User, "isGuest">;

export interface UserFriends {
  friends: Friend[];
}

export type Messages = (Omit<PrismaMessage, "createdAt"> & {
  createdAt: string;
})[];

interface ChatDataIsNotFriend {
  messages: Messages;
  user: Pick<User, "username" | "imageUrl"> & { lastSeen: null };
  friendRequestStatus: null;
}

interface ChatDataIsPendingFriend {
  messages: Messages;
  user: Pick<User, "username" | "imageUrl"> & { lastSeen: null };
  friendRequestStatus: {
    type: Extract<FriendStatus, "PENDING">;
    senderId: string;
  };
}

interface ChatDataIsFriend {
  messages: Messages;
  user: Pick<User, "username" | "lastSeen" | "imageUrl">;
  friendRequestStatus: {
    type: Extract<FriendStatus, "ACCEPTED">;
    senderId: string;
  };
}

export type ChatData =
  | ChatDataIsFriend
  | ChatDataIsNotFriend
  | ChatDataIsPendingFriend;

export interface GroupChat extends Omit<PrismaGroupChat, "createdAt"> {
  createdAt: string;
}

export interface GroupMessages {
  messages: (Omit<PrismaMessage, "createdAt"> & { createdAt: string } & {
    sender: Omit<PrismaUser, "password" | "isGuest" | "lastSeen">;
  })[];
  group: Omit<PrismaGroupChat, "adminId" | "createdAt"> & { createdAt: string };
}

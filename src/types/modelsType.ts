import type { User as PrismaUser, Message as PrismaMessage } from "prismaTypes";

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

export interface ChatData {
  messages: Messages;
  user: Pick<User, "username" | "lastSeen" | "imageUrl">;
}

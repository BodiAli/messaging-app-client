import type { User as PrismaUser } from "prismaTypes";

export interface User extends Omit<PrismaUser, "lastSeen" | "password"> {
  lastSeen: string;
}

export type Friend = Omit<User, "isGuest">;

export interface UserFriends {
  friends: Friend[];
}

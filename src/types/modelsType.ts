import type { User as PrismaUser } from "prismaTypes";

export interface User extends Omit<PrismaUser, "lastSeen" | "password"> {
  lastSeen: string;
}

export type UserFriends = Omit<User, "isGuest">[];

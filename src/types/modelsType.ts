import type { User as PrismaUser } from "prismaTypes";

export interface User extends Omit<PrismaUser, "lastSeen" | "password"> {
  lastSeen: string;
}

export interface UserFriends {
  friends: Omit<User, "isGuest">[];
}

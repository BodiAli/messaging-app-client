export interface User {
  id: string;
  username: string;
  lastSeen: string;
  isGuest: boolean;
  imageUrl: null | string;
}

export type UserFriends = Omit<User, "isGuest">[];

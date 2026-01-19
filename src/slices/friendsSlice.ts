import apiSlice from "./apiSlice";
import type { UserFriends } from "@/types/modelsType";

const apiSliceWithFriends = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getFriends: build.query<UserFriends, undefined>({
        query: () => "/users/me/friends",
      }),
    };
  },
});

export const { useGetFriendsQuery } = apiSliceWithFriends;

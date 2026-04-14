import apiSlice from "./apiSlice";
import type { NonFriends, UserFriends } from "@/types/modelsType";

const apiSliceWithFriends = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getFriends: build.query<UserFriends, undefined>({
        query: () => "/users/me/friends",
        providesTags: ["Friend"],
      }),
      addFriend: build.mutation<{ message: string }, string>({
        query: (receiverId) => {
          return {
            url: "/friendships",
            method: "POST",
            body: {
              receiverId,
            },
          };
        },
        invalidatesTags: ["Message"],
      }),
      getNonFriends: build.query<NonFriends, undefined>({
        query: () => "/users/me/anonymous",
        providesTags: ["Non-friend"],
      }),
    };
  },
});

export const {
  useGetFriendsQuery,
  useAddFriendMutation,
  useGetNonFriendsQuery,
} = apiSliceWithFriends;

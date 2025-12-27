import apiSlice from "./apiSlice";
import type { UserFriends } from "@/types/modelsType";

const apiSliceWithFriends = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getFriends: build.query<UserFriends, undefined>({
        query: () => {
          return {
            url: "/users/me/friends",
            responseHandler(response) {
              if (response.status === 401) {
                return response.text();
              }
              return response.json();
            },
          };
        },
      }),
    };
  },
});

export const { useGetFriendsQuery } = apiSliceWithFriends;

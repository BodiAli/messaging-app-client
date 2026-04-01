import apiSlice from "./apiSlice";
import type { GroupChat, GroupMessages } from "@/types/modelsType";

const apiSliceWithGroups = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getGroups: build.query<{ groups: GroupChat[] }, undefined>({
        query: () => "/users/me/groups",
        providesTags: ["Group"],
      }),
      createGroup: build.mutation<{ group: GroupChat }, string, undefined>({
        query: (groupName) => {
          return {
            method: "POST",
            url: "/users/me/groups",
            body: {
              groupName,
            },
          };
        },
        invalidatesTags: ["Group"],
      }),
      getGroupMessages: build.query<GroupMessages, string>({
        query: (groupId) => `/users/me/groups/${groupId}/messages`,
      }),
    };
  },
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupMessagesQuery,
} = apiSliceWithGroups;

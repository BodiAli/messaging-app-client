import apiSlice from "./apiSlice";
import type { GroupChat, GroupMessages, Message } from "@/types/modelsType";

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
      sendGroupMessage: build.mutation<
        { message: Message },
        { groupId: string; formData: FormData }
      >({
        query: ({ groupId, formData }) => {
          return {
            url: `/users/me/groups/${groupId}/messages`,
            method: "POST",
            body: formData,
          };
        },
      }),
    };
  },
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} = apiSliceWithGroups;

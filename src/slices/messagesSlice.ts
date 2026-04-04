import apiSlice from "./apiSlice";
import type { ChatData, GroupMessages, Message } from "@/types/modelsType";

const apiSliceWithMessages = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getTwoUsersMessages: build.query<ChatData, string>({
        query: (userId) => `/users/${userId}/messages`,
        providesTags: ["Message"],
        keepUnusedDataFor: 0,
      }),
      sendMessage: build.mutation<
        undefined,
        { userId: string; formData: FormData }
      >({
        query: ({ userId, formData }) => {
          return {
            url: `/users/${userId}/messages`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: ["Message"],
      }),
      getGroupMessages: build.query<GroupMessages, string>({
        query: (groupId) => `/users/me/groups/${groupId}/messages`,
        providesTags: ["Message"],
        keepUnusedDataFor: 0,
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
        invalidatesTags: ["Message"],
      }),
    };
  },
});

export const {
  useGetTwoUsersMessagesQuery,
  useSendMessageMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} = apiSliceWithMessages;

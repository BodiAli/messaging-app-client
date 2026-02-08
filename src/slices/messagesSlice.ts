import apiSlice from "./apiSlice";
import type { ChatData } from "@/types/modelsType";

const apiSliceWithMessages = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getTwoUsersMessages: build.query<ChatData, string>({
        query: (userId) => `/users/${userId}/messages`,
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
      }),
    };
  },
});

export const { useGetTwoUsersMessagesQuery, useSendMessageMutation } =
  apiSliceWithMessages;

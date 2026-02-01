import apiSlice from "./apiSlice";
import type { ChatData } from "@/types/modelsType";

const apiSliceWithMessages = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getTwuUsersMessages: build.query<ChatData, string>({
        query: (userId) => `/users/${userId}/messages`,
      }),
    };
  },
});

export const { useGetTwuUsersMessagesQuery } = apiSliceWithMessages;

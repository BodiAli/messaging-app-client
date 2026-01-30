import apiSlice from "./apiSlice";
import type { Messages } from "@/types/modelsType";

const apiSliceWithMessages = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getTwuUsersMessages: build.query<{ messages: Messages }, string>({
        query: (userId) => `/users/${userId}/messages`,
      }),
    };
  },
});

export const { useGetTwuUsersMessagesQuery } = apiSliceWithMessages;

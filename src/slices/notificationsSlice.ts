import apiSlice from "./apiSlice";
import type { UserNotifications } from "@/types/userNotifications";

const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getNotifications: build.query<UserNotifications, undefined>({
        query: () => "/notifications/me",
      }),
    };
  },
});

export const { useGetNotificationsQuery } = apiSliceWithNotifications;

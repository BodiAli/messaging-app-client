import apiSlice from "./apiSlice";
import type { UserNotifications } from "@/types/userNotifications";

const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getNotifications: build.query<UserNotifications, undefined>({
        query: () => "/notifications/me",
        providesTags: ["Notification"],
      }),
      rejectGroupInvite: build.mutation<undefined, string>({
        query: (groupId) => {
          return {
            url: `/users/me/groups/${groupId}/notifications`,
            method: "DELETE",
          };
        },
        invalidatesTags: ["Notification"],
      }),
    };
  },
});

export const { useGetNotificationsQuery, useRejectGroupInviteMutation } =
  apiSliceWithNotifications;

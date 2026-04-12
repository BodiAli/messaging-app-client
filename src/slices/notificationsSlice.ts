import apiSlice from "./apiSlice";
import type { UserNotifications } from "@/types/userNotifications";

const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getNotifications: build.query<UserNotifications, undefined>({
        query: () => "/notifications/me",
        providesTags: ["Notification"],
        keepUnusedDataFor: 0,
      }),
      rejectGroupInvite: build.mutation<undefined, string>({
        query: (groupId) => {
          return {
            url: `/users/me/groups/${groupId}/notifications`,
            method: "DELETE",
            responseHandler(response) {
              if (response.ok || response.status === 401) {
                return response.text();
              }

              return response.json();
            },
          };
        },
        invalidatesTags: ["Notification"],
      }),
      acceptGroupInvite: build.mutation<undefined, string>({
        query: (groupId) => {
          return {
            url: `/users/me/groups/${groupId}/notifications`,
            method: "PATCH",
            responseHandler(response) {
              if (response.ok || response.status === 401) {
                return response.text();
              }
              return response.json();
            },
          };
        },
        invalidatesTags: ["Notification", "Group"],
      }),
      declineFriendRequest: build.mutation<undefined, string>({
        query: (friendRequestId) => {
          return {
            url: `/friendships/${friendRequestId}`,
            method: "DELETE",
            responseHandler(response) {
              if (response.ok || response.status === 401) {
                return response.text();
              }
              return response.json();
            },
          };
        },
        invalidatesTags: ["Notification"],
      }),
      acceptFriendRequest: build.mutation<undefined, string>({
        query: (friendRequestId) => {
          return {
            url: `/friendships/${friendRequestId}`,
            method: "PATCH",
            responseHandler(response) {
              if (response.ok || response.status === 401) {
                return response.text();
              }
              return response.json();
            },
          };
        },
        invalidatesTags: ["Notification", "Friend"],
      }),
    };
  },
});

export const {
  useGetNotificationsQuery,
  useRejectGroupInviteMutation,
  useAcceptGroupInviteMutation,
  useDeclineFriendRequestMutation,
  useAcceptFriendRequestMutation,
} = apiSliceWithNotifications;

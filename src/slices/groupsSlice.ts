import apiSlice from "./apiSlice";
import type { GroupChat, GroupDetails } from "@/types/modelsType";

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
      getGroupDetails: build.query<GroupDetails, string>({
        query: (groupId) => `/users/me/groups/${groupId}`,
      }),
      sendGroupInvite: build.mutation<
        undefined,
        { friendIds: string[]; groupId: string }
      >({
        query: ({ friendIds, groupId }) => {
          return {
            url: `/users/me/groups/${groupId}/notifications`,
            method: "POST",
            body: {
              userIds: friendIds,
            },
            responseHandler(response) {
              if (response.ok) {
                return response.text();
              }
              return response.json();
            },
          };
        },
      }),
      updateGroupName: build.mutation<
        GroupChat,
        { groupName: string; groupId: string }
      >({
        query: ({ groupId, groupName }) => {
          return {
            url: `/users/me/groups/${groupId}`,
            method: "PATCH",
            body: {
              groupName,
            },
          };
        },
        invalidatesTags: ["Group"],
      }),
      deleteGroup: build.mutation<string, string>({
        query: (groupId) => {
          return {
            url: `/users/me/groups/${groupId}`,
            method: "DELETE",
            responseHandler(response) {
              if (response.ok) {
                return response.text();
              }
              return response.json();
            },
          };
        },
        invalidatesTags: ["Group"],
      }),
      removeMember: build.mutation<
        string,
        { memberId: string; groupId: string }
      >({
        query: ({ groupId, memberId }) => {
          return {
            url: `/users/me/groups/${groupId}/members/${memberId}`,
            method: "DELETE",
            responseHandler(response) {
              if (response.ok) {
                return response.text();
              }
              return response.json();
            },
          };
        },
        invalidatesTags: ["Group"],
      }),
    };
  },
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupDetailsQuery,
  useSendGroupInviteMutation,
  useUpdateGroupNameMutation,
  useDeleteGroupMutation,
  useRemoveMemberMutation,
} = apiSliceWithGroups;

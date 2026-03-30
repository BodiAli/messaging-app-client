import apiSlice from "./apiSlice";
import type { GroupChat } from "@/types/modelsType";

const apiSliceWithGroups = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getGroups: build.query<{ groups: GroupChat[] }, undefined>({
        query: () => "/users/me/groups",
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
      }),
    };
  },
});

export const { useGetGroupsQuery, useCreateGroupMutation } = apiSliceWithGroups;

import apiSlice from "./apiSlice";
import type { GroupChat } from "@/types/modelsType";

const apiSliceWithGroups = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getGroups: build.query<{ groups: GroupChat[] }, undefined>({
        query: () => "/users/me/groups",
      }),
    };
  },
});

export const { useGetGroupsQuery } = apiSliceWithGroups;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "../types/modelsType";

const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_SERVER_URL }),
  endpoints(build) {
    return {
      getUsers: build.query<User, undefined>({
        query: () => "/auth/get-user",
      }),
    };
  },
});

export const { useGetUsersQuery } = apiSlice;

export default apiSlice;

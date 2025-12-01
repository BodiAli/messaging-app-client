import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import serverUrl from "@/utils/serverUrl";

const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: serverUrl }),
  endpoints() {
    return {};
  },
});

export default apiSlice;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import serverUrl from "@/utils/serverUrl";
import { getJwtToken } from "@/services/localStorage";

const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: serverUrl,
    prepareHeaders(headers, { endpoint }) {
      const jwtToken = getJwtToken();
      if (
        endpoint !== "getUser" &&
        endpoint !== "login" &&
        endpoint !== "signUp" &&
        endpoint !== "loginAsGuest" &&
        jwtToken
      ) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
      }
    },
  }),
  endpoints() {
    return {};
  },
});

export default apiSlice;

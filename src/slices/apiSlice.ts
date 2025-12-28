import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import serverUrl from "@/utils/serverUrl";
import { getJwtToken } from "@/services/localStorage";
import { logOut } from "./authSlice";

const isProtectedRoute: (endpoint: string) => boolean = (endpoint) => {
  return (
    endpoint !== "getUser" &&
    endpoint !== "login" &&
    endpoint !== "signUp" &&
    endpoint !== "loginAsGuest"
  );
};

const baseQuery = fetchBaseQuery({
  baseUrl: serverUrl,
  prepareHeaders(headers, { endpoint }) {
    const jwtToken = getJwtToken();
    if (isProtectedRoute(endpoint) && jwtToken) {
      headers.set("Authorization", `Bearer ${jwtToken}`);
    }
  },
});

const baseQueryWithLogout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && isProtectedRoute(api.endpoint)) {
    api.dispatch(logOut());
  }

  return result;
};

const apiSlice = createApi({
  baseQuery: baseQueryWithLogout,
  endpoints() {
    return {};
  },
});

export default apiSlice;

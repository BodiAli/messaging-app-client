import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { setJwtToken } from "@/services/localStorage";
import apiSlice from "./apiSlice";
import type { User } from "@/types/modelsType";
import type { AppStartListening } from "@/config/listenerMiddleware";

const apiSliceWithAuth = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      getUser: build.query<{ user: User }, string>({
        query(token) {
          return {
            url: "/auth/get-user",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseHandler(response) {
              if (response.status === 401) {
                return response.text();
              }

              return response.json();
            },
          };
        },
      }),
      login: build.mutation<
        { user: User; token: string },
        { username: string; password: string }
      >({
        query({ username, password }) {
          return {
            url: "/auth/log-in",
            method: "POST",
            body: { username, password },
          };
        },
      }),
      signUp: build.mutation<
        { user: User; token: string },
        { username: string; password: string; confirmPassword: string }
      >({
        query({ confirmPassword, password, username }) {
          return {
            url: "/auth/sign-up",
            method: "POST",
            body: { username, password, confirmPassword },
          };
        },
      }),
    };
  },
});

const authListeners = (startAppListening: AppStartListening) => {
  const isTokenReceived = isAnyOf(
    apiSliceWithAuth.endpoints.login.matchFulfilled,
    apiSliceWithAuth.endpoints.signUp.matchFulfilled,
  );

  startAppListening({
    matcher: isTokenReceived,
    effect: (action) => {
      setJwtToken(action.payload.token);
    },
  });
};

interface AuthState {
  user: null | User;
  loading: boolean;
  error?: null | string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addMatcher(
      apiSliceWithAuth.endpoints.getUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      },
    );
    builder.addMatcher(
      apiSliceWithAuth.endpoints.getUser.matchPending,
      (state) => {
        state.loading = true;
      },
    );
    builder.addMatcher(
      apiSliceWithAuth.endpoints.getUser.matchRejected,
      (state, action) => {
        state.loading = false;

        const payload = action.payload;
        if (payload) {
          if (typeof payload.status === "number") {
            if (payload.status === 401) {
              state.error = payload.data as string;
              return;
            }

            state.error = (payload.data as { error: string }).error;
            return;
          }

          state.error = payload.error;
        }
      },
    );
    builder.addMatcher(
      apiSliceWithAuth.endpoints.login.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
      },
    );
    builder.addMatcher(
      apiSliceWithAuth.endpoints.signUp.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
      },
    );
  },
  selectors: {
    selectUser(state) {
      return state.user;
    },
    selectUserIsLoading(state) {
      return state.loading;
    },
    selectUserError(state) {
      return state.error;
    },
  },
});

export { apiSliceWithAuth, authListeners };

export const { useLoginMutation, useGetUserQuery, useSignUpMutation } =
  apiSliceWithAuth;

export const { selectUser, selectUserIsLoading, selectUserError } =
  authSlice.selectors;

export default authSlice.reducer;

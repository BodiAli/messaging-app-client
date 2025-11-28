import serverUrl from "@/utils/serverUrl";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "@/types/modelsType";

interface RejectedValue {
  error: string;
}

const getUser = createAsyncThunk<{ user: User }, string, { rejectValue: RejectedValue }>(
  "auth/getUser",
  async (token: string, thunkApi) => {
    const response = await fetch(`${serverUrl}/auth/get-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return thunkApi.rejectWithValue({ error: response.statusText.toLowerCase() });
      }

      const data = (await response.json()) as { error: string };

      return thunkApi.rejectWithValue({ error: data.error });
    }

    const data = (await response.json()) as { user: User };

    return data;
  }
);

interface AuthState {
  user: null | User;
  status: "idle" | "success" | "loading" | "failed";
  error?: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getUser.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.status = "failed";
      if (action.payload) {
        state.error = action.payload.error;
      } else {
        state.error = action.error.message;
      }
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.status = "success";
      state.user = action.payload.user;
    });
  },
  selectors: {
    selectUser(state) {
      return state.user;
    },
    selectUserStatus(state) {
      return state.status;
    },
    selectUserError(state) {
      return state.error;
    },
  },
});

export { getUser };

export const { selectUser, selectUserStatus, selectUserError } = authSlice.selectors;

export default authSlice.reducer;

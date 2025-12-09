import { configureStore } from "@reduxjs/toolkit";
import { listenerMiddleware } from "./listenerMiddleware";
import authReducer from "../slices/authSlice";
import apiSlice from "../slices/apiSlice";

export default function setupStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(apiSlice.middleware);
    },
  });
}

type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;

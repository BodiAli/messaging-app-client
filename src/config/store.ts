import { configureStore } from "@reduxjs/toolkit";
import apiSlice from "../slices/apiSlice";

export default function setupStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware().concat(apiSlice.middleware);
    },
  });
}

import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { listenerMiddleware } from "./listenerMiddleware";
import authReducer from "../slices/authSlice";
import apiSlice from "../slices/apiSlice";

// Create the root reducer independently to obtain the PreloadedState type
const rootReducer = combineSlices(apiSlice, {
  auth: authReducer,
});

export default function setupStore(preloadedState?: PreloadedState) {
  return configureStore({
    reducer: rootReducer,
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware);
    },
    preloadedState,
  });
}

type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
export type PreloadedState = Parameters<typeof rootReducer>[0];

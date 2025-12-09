import { createListenerMiddleware } from "@reduxjs/toolkit";
import { loginListeners } from "@/slices/authSlice";
import type { AppDispatch, RootState } from "./store";

const listenerMiddleware = createListenerMiddleware();

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

type AppStartListening = typeof startAppListening;

loginListeners(startAppListening);

export { listenerMiddleware, type AppStartListening };

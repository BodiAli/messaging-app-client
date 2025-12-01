import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./store";
import { loginListeners } from "@/slices/authSlice";

const listenerMiddleware = createListenerMiddleware();

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

type AppStartListening = typeof startAppListening;

loginListeners(startAppListening);

export { listenerMiddleware, type AppStartListening };

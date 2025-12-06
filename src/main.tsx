import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import setupStore from "./config/store.js";
import routes from "./routes/routes.js";
import { apiSliceWithAuth } from "./slices/authSlice.js";
import { getJwtToken } from "./services/localStorage.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import initializeTheme from "./libs/theme.js";

const store = setupStore();

const router = createBrowserRouter(routes);

const jwtToken = getJwtToken();

if (jwtToken) {
  void store.dispatch(apiSliceWithAuth.endpoints.getUser.initiate(jwtToken));
}

const theme = initializeTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);

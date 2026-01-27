import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import setupStore from "./config/store.js";
import routes from "./routes/routes.js";
import { apiSliceWithAuth } from "./slices/authSlice.js";
import { getJwtToken } from "./services/localStorage.js";
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
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>,
);

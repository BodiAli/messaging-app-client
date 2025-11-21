import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import setupStore from "./config/store.js";
import routes from "./routes/routes.js";
import "./global-styles/reset.css";

const store = setupStore();

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

import type { RouteObject } from "react-router";
import App from "@/app/App";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/app/ProtectedRoute";
import AppLayout from "@/app/AppLayout";

const routes: RouteObject[] = [
  {
    Component: AppLayout,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        ),
      },
      {
        path: "/log-in",
        Component: LoginPage,
      },
    ],
  },
];

export default routes;

import type { RouteObject } from "react-router";
import App from "@/app/App";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/app/ProtectedRoute";
import AppLayout from "@/app/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

const routes: RouteObject[] = [
  {
    ErrorBoundary: ErrorBoundary,
    children: [
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
    ],
  },
];

export default routes;

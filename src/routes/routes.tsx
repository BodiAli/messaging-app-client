import type { RouteObject } from "react-router";
import App from "@/app/App";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/app/ProtectedRoute";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: () => <p>Main page</p>,
      },
    ],
  },
  {
    path: "/log-in",
    Component: LoginPage,
  },
];

export default routes;

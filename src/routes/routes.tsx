import App from "@/app/App";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/app/ProtectedRoute";
import AppLayout from "@/app/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFoundPage from "@/pages/NotFoundPage";
import SignupPage from "@/pages/SignupPage";
import FriendsPage from "@/pages/FriendsPage";
import GroupsPage from "@/pages/GroupsPage";
import NonFriendsPage from "@/pages/NonFriendsPage";
import ProfilePage from "@/pages/ProfilePage";
import type { RouteObject } from "react-router";

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
            children: [
              {
                path: "/friends",
                Component: FriendsPage,
              },
              {
                path: "/groups",
                Component: GroupsPage,
              },
              {
                path: "/non-friends",
                Component: NonFriendsPage,
              },
              {
                path: "/profile",
                Component: ProfilePage,
              },
            ],
          },
          {
            path: "/log-in",
            Component: LoginPage,
          },
          {
            path: "/sign-up",
            Component: SignupPage,
          },
          {
            path: "*",
            Component: NotFoundPage,
          },
        ],
      },
    ],
  },
];

export default routes;

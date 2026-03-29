import MainLayout from "@/app/MainLayout";
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
import TwoUsersChatPage from "@/pages/TwoUsersChatPage";
import IndexPage from "@/pages/IndexPage";
import GroupChatPage from "@/pages/GroupChatPage";
import GroupsPageIndex from "@/components/GroupsPageIndex";
import CreateGroupPage from "@/pages/CreateGroupPage";
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
                <MainLayout />
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                Component: IndexPage,
              },
              {
                path: "/friends",
                Component: FriendsPage,
                children: [
                  {
                    path: ":userId",
                    Component: TwoUsersChatPage,
                  },
                ],
              },
              {
                path: "/groups",
                Component: GroupsPage,
                children: [
                  {
                    index: true,
                    Component: GroupsPageIndex,
                  },
                  {
                    path: "create-group",
                    Component: CreateGroupPage,
                  },
                  {
                    path: ":groupId",
                    Component: GroupChatPage,
                  },
                ],
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

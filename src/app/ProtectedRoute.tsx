import { useGetUsersQuery } from "@/slices/apiSlice";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { data: user, isLoading, isSuccess } = useGetUsersQuery(undefined);

  if (isLoading) return <p>Loading...</p>;

  console.log("DATA", user);
  if (!isSuccess) {
    return <Navigate to="/log-in" />;
  }

  return children;
}

import { useGetUsersQuery } from "@/slices/apiSlice";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isError, isLoading, error } = useGetUsersQuery(undefined);

  if (isLoading) return <p>Loading...</p>;

  if (isError) {
    if ("status" in error) {
      if (error.status === 401) {
        return <Navigate to="/log-in" />;
      }

      throw new Error(error.data as string);
    }

    throw new Error(error.message);
  }

  return children;
}

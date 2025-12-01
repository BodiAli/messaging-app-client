import Loader from "@/components/Loader";
import { useRef, type PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { useAppSelector } from "./hooks";
import { selectUser, selectUserError, selectUserIsLoading } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const jwtTokenRef = useRef(getJwtToken());
  const user = useAppSelector(selectUser);
  const userIsLoading = useAppSelector(selectUserIsLoading);
  const userError = useAppSelector(selectUserError);

  if (!jwtTokenRef.current) return <Navigate to="/log-in" />;

  if (userIsLoading) return <Loader />;

  if (userError) {
    if (userError !== "Unauthorized") {
      throw new Error(userError);
    }
  }

  if (!user) return <Navigate to="/log-in" />;

  return children;
}

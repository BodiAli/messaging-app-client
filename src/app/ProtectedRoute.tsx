import Loader from "@/components/Loader";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getUser, selectUserError, selectUserStatus } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const jwtTokenRef = useRef(getJwtToken());
  const dispatch = useAppDispatch();
  const userError = useAppSelector(selectUserError);
  const userStatus = useAppSelector(selectUserStatus);

  useEffect(() => {
    if (jwtTokenRef.current) {
      void dispatch(getUser(jwtTokenRef.current));
    }
  }, [dispatch]);

  if (!jwtTokenRef.current) return <Navigate to="/log-in" />;

  if (userStatus === "loading") return <Loader />;

  if (userStatus === "failed" && userError) {
    if (userError === "unauthorized") {
      return <Navigate to="/log-in" />;
    }

    throw new Error(userError);
  }

  return children;
}

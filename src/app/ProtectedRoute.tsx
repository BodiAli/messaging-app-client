import Loader from "@/components/Loader";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getUser, selectUserError } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";

// TODO: check for userStatus instead of userError

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const jwtTokenRef = useRef(getJwtToken());
  const dispatch = useAppDispatch();
  const userError = useAppSelector(selectUserError);

  useEffect(() => {
    if (jwtTokenRef.current) {
      void dispatch(getUser(jwtTokenRef.current));
    }
  }, [dispatch]);

  if (!jwtTokenRef.current) return <Navigate to="/log-in" />;

  if (userError) {
    if (userError === "unauthorized") {
      return <Navigate to="/log-in" />;
    }

    throw new Error(userError);
  }

  return children;
}

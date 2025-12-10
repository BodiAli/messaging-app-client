import { useRef, type PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { selectUser } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";
import { useAppSelector } from "./hooks";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const jwtTokenRef = useRef(getJwtToken());
  const user = useAppSelector(selectUser);

  if (!jwtTokenRef.current) return <Navigate to="/log-in" replace />;

  if (!user) return <Navigate to="/log-in" />;

  return children;
}

import { Outlet } from "react-router";
import Header from "@/components/Header";
import { selectUserError, selectUserIsLoading } from "@/slices/authSlice";
import Loader from "@/components/Loader/Loader";
import { useAppSelector } from "./hooks";

export default function AppLayout() {
  const userIsLoading = useAppSelector(selectUserIsLoading);
  const userError = useAppSelector(selectUserError);

  if (userIsLoading) return <Loader />;

  if (userError) {
    if (userError !== "Unauthorized") {
      throw new Error(userError);
    }
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

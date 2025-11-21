import { Outlet } from "react-router";
import Header from "../components/Header";
import { useGetUsersQuery } from "../slices/apiSlice";

export default function App() {
  const res = useGetUsersQuery(undefined);

  console.log(res);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

import { Outlet } from "react-router";
import NavigationSidebar from "@/components/NavigationSidebar";

export default function MainLayout() {
  return (
    <>
      <NavigationSidebar />
      <Outlet />
    </>
  );
}

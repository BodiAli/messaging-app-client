import { Outlet } from "react-router";
import { Box } from "@mui/material";
import NavigationSidebar from "@/components/NavigationSidebar";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <NavigationSidebar />
      <Outlet />
    </Box>
  );
}

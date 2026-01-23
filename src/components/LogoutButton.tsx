import { IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { logOut } from "@/slices/authSlice";
import { useAppDispatch } from "@/app/hooks";

export default function LogoutButton() {
  const dispatch = useAppDispatch();

  const handleLogOut = () => {
    dispatch(logOut());
  };

  return (
    <IconButton
      size="large"
      onClick={handleLogOut}
      aria-label="log out"
      sx={{ color: "#fff" }}
    >
      <LogoutIcon fontSize="inherit" />
    </IconButton>
  );
}

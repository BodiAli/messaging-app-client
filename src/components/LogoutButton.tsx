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
    <IconButton onClick={handleLogOut} aria-label="log out">
      <LogoutIcon />
    </IconButton>
  );
}

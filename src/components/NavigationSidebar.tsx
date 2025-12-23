import { Link } from "react-router";
import FriendsIcon from "@mui/icons-material/People";

export default function NavigationSidebar() {
  return (
    <nav>
      <Link to="/friends">
        <FriendsIcon /> Friends
      </Link>
    </nav>
  );
}

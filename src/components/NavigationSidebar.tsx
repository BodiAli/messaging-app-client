import { Link } from "react-router";
import FriendsIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

export default function NavigationSidebar() {
  return (
    <nav>
      <Link to="/friends">
        <FriendsIcon />
        Friends
      </Link>
      <Link to="/groups">
        <GroupsIcon />
        Groups
      </Link>
      <Link to="/non-friends">
        <PermIdentityIcon />
        Non friends
      </Link>
      <Link to="/profile">
        <AccountBoxIcon />
        Profile
      </Link>
    </nav>
  );
}

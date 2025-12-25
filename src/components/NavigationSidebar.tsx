import { NavLink as RouterLink } from "react-router";
import FriendsIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { Link, Drawer, Stack } from "@mui/material";
import type { ReactNode } from "react";

const StyledNavLink = ({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) => {
  return (
    <Link
      underline="none"
      component={RouterLink}
      to={to}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        paddingY: 1,
        paddingLeft: 1,
        transition: "background-color 200ms",
        "&:hover": {
          backgroundColor: "#cad0d8",
        },
        "&.active": {
          borderBottom: "1px solid black",
        },
      }}
    >
      {children}
    </Link>
  );
};

const drawerWidth = 220;

export default function NavigationSidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
      }}
      slotProps={{
        paper: {
          sx: {
            top: "auto",
            backgroundColor: "#ffffff53",
            paddingY: 4,
            boxSizing: "border-box",
            width: drawerWidth,
          },
        },
      }}
    >
      <Stack
        component="nav"
        spacing={4}
        sx={{
          fontSize: "1.2rem",
        }}
      >
        <StyledNavLink to="/friends">
          <FriendsIcon />
          Friends
        </StyledNavLink>
        <StyledNavLink to="/groups">
          <GroupsIcon />
          Groups
        </StyledNavLink>
        <StyledNavLink to="/non-friends">
          <PermIdentityIcon />
          Non friends
        </StyledNavLink>
        <StyledNavLink to="/profile">
          <AccountBoxIcon />
          Profile
        </StyledNavLink>
      </Stack>
    </Drawer>
  );
}

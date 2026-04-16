import { NavLink as RouterLink, useLocation } from "react-router";
import FriendsIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import {
  Link,
  Drawer,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
  type BottomNavigationActionProps,
} from "@mui/material";
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

const CustomBottomNavigationAction = (
  props: BottomNavigationActionProps<"button", { to: string }>,
) => {
  return <BottomNavigationAction {...props} />;
};

const drawerWidth = 220;

export default function NavigationSidebar() {
  const { pathname } = useLocation();
  const rootPath = pathname.split("/")[1];

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          display: {
            xs: "none",
            md: "block",
          },
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
      <BottomNavigation
        value={rootPath}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: {
            xs: "flex",
            md: "none",
          },
          zIndex: 1,
        }}
      >
        <CustomBottomNavigationAction
          value={"friends"}
          label="Friends"
          icon={<FriendsIcon />}
          LinkComponent={RouterLink}
          to="/friends"
        />
        <CustomBottomNavigationAction
          value={"groups"}
          label="Groups"
          icon={<GroupsIcon />}
          LinkComponent={RouterLink}
          to="/groups"
        />
        <CustomBottomNavigationAction
          value={"non-friends"}
          label="Non friends"
          icon={<PermIdentityIcon />}
          LinkComponent={RouterLink}
          to="/non-friends"
        />
        <CustomBottomNavigationAction
          value={"profile"}
          label="Profile"
          icon={<AccountBoxIcon />}
          LinkComponent={RouterLink}
          to="/profile"
        />
      </BottomNavigation>
    </>
  );
}

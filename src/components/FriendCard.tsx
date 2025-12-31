import { Link as RouterLink } from "react-router";
import { Badge, Avatar, Typography, Link, type LinkProps } from "@mui/material";
import isOnline from "@/utils/isOnline";
import type { Friend } from "@/types/modelsType";

const StyledLink = (props: LinkProps<"a", { to: string }>) => {
  return <Link {...props}></Link>;
};

export default function FriendCard({ friend }: { friend: Friend }) {
  const showProfilePic = friend.imageUrl ? (
    <Badge
      variant="dot"
      color="success"
      overlap="circular"
      invisible={!isOnline(friend.lastSeen)}
      slotProps={{
        badge() {
          return {
            "data-testid": "online-badge",
          };
        },
      }}
    >
      <Avatar
        src={friend.imageUrl}
        alt={`${friend.username}'s profile picture`}
      />
    </Badge>
  ) : (
    <Badge
      variant="dot"
      color="success"
      overlap="circular"
      invisible={!isOnline(friend.lastSeen)}
      slotProps={{
        badge() {
          return {
            "data-testid": "online-badge",
          };
        },
      }}
    >
      <Avatar title="usernameFriend2's no profile picture" />
    </Badge>
  );

  return (
    <StyledLink
      underline="none"
      key={friend.id}
      component={RouterLink}
      aria-label={`${friend.username} friend`}
      to={friend.id}
      sx={{
        backgroundColor: "#ffffff70",
        color: "#000",
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        transition: "background-color 200ms",
        "&:hover": {
          backgroundColor: "#f0efef5e",
        },
      }}
    >
      {showProfilePic}
      <Typography sx={{ fontSize: "1.2rem" }}>{friend.username}</Typography>
    </StyledLink>
  );
}

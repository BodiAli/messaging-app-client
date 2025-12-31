import { Link } from "react-router";
import { Badge, Avatar, Typography } from "@mui/material";
import isOnline from "@/utils/isOnline";
import type { Friend } from "@/types/modelsType";

export default function FriendCard({ friend }: { friend: Friend }) {
  return (
    <Link
      key={friend.id}
      aria-label={`${friend.username} friend`}
      to={friend.id}
    >
      {friend.imageUrl ? (
        <Badge
          data-testid="online-badge"
          variant="dot"
          color="success"
          overlap="circular"
          invisible={!isOnline(friend.lastSeen)}
        >
          <Avatar
            src={friend.imageUrl}
            alt={`${friend.username}'s profile picture`}
          />
        </Badge>
      ) : (
        <Badge
          data-testid="online-badge"
          variant="dot"
          color="success"
          overlap="circular"
          invisible={!isOnline(friend.lastSeen)}
        >
          <Avatar title="usernameFriend2's no profile picture" />
        </Badge>
      )}
      <Typography>{friend.username}</Typography>
    </Link>
  );
}

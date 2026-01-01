import { NavLink } from "react-router";
import {
  Badge,
  Avatar,
  Card,
  CardHeader,
  CardActionArea,
  type CardActionAreaProps,
} from "@mui/material";
import isOnline from "@/utils/isOnline";
import type { Friend } from "@/types/modelsType";

const CustomCardActionArea = (
  props: CardActionAreaProps<"button", { to: string }>,
) => {
  return <CardActionArea {...props} />;
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
    <Card>
      <CustomCardActionArea
        aria-label={`${friend.username} friend`}
        LinkComponent={NavLink}
        to={friend.id}
        sx={{
          "&.active": {
            backgroundColor: "action.selected",
          },
        }}
      >
        <CardHeader avatar={showProfilePic} title={friend.username} />
      </CustomCardActionArea>
    </Card>
  );
}

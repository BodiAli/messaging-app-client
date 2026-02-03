import { Avatar } from "@mui/material";

export default function UsersAvatar({
  imageUrl,
  username,
}: {
  imageUrl: null | string;
  username: string;
}) {
  return imageUrl ? (
    <Avatar src={imageUrl} alt={`${username}'s profile picture`} />
  ) : (
    <Avatar title={`${username} no profile picture`} />
  );
}

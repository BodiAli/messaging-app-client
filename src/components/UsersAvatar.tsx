import { Avatar } from "@mui/material";

export default function UsersAvatar({
  imageUrl,
  username,
}: {
  imageUrl: null | string;
  username: string;
}) {
  return imageUrl ? (
    <Avatar
      sx={{
        width: "80px",
        height: "80px",
      }}
      slotProps={{
        img: {
          sx: {
            objectPosition: "top",
          },
        },
      }}
      src={imageUrl}
      alt={`${username}'s profile picture`}
    />
  ) : (
    <Avatar
      sx={{
        width: "60px",
        height: "60px",
      }}
      slotProps={{
        img: {
          sx: {
            objectPosition: "top",
          },
        },
      }}
      title={`${username} no profile picture`}
    />
  );
}

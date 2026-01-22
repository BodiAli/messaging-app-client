import { Menu, MenuItem } from "@mui/material";
import { useGetNotificationsQuery } from "@/slices/notificationsSlice";
import isUnauthorized from "@/utils/isUnauthorized";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import NotificationItem from "./NotificationItem";

const NOTIFICATION_SKELETONS = ["SKELETON1", "SKELETON2"];

export default function Notifications({
  open,
  anchorElement,
  onClose,
}: {
  open: boolean;
  anchorElement: HTMLButtonElement;
  onClose: () => void;
}) {
  const {
    data = { notifications: [] },
    isLoading,
    error,
    isError,
  } = useGetNotificationsQuery(undefined);

  if (isError && !isUnauthorized(error)) {
    handleUnexpectedError(error);
  }

  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      {isLoading ? (
        NOTIFICATION_SKELETONS.map((v) => {
          return (
            <NotificationItem
              key={v}
              isLoading={isLoading}
              notification={undefined}
            />
          );
        })
      ) : data.notifications.length > 0 ? (
        data.notifications.map((notification) => {
          return (
            <NotificationItem
              isLoading={isLoading}
              key={notification.id}
              notification={notification}
            />
          );
        })
      ) : (
        <MenuItem sx={{ fontSize: "1.1rem", padding: 2 }}>
          No current notifications
        </MenuItem>
      )}
    </Menu>
  );
}

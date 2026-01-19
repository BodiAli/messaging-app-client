import { Menu, MenuItem } from "@mui/material";
import { useGetNotificationsQuery } from "@/slices/notificationsSlice";
import isUnauthorized from "@/utils/isUnauthorized";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import formatDate from "@/utils/formatDate";
import Loader from "./Loader/Loader";

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

  if (isLoading) return <Loader />;

  if (isError && !isUnauthorized(error)) {
    handleUnexpectedError(error);
  }

  const notificationContent =
    data.notifications.length === 0 ? (
      <p>No current notifications</p>
    ) : (
      data.notifications.map((notification) => {
        return (
          <MenuItem key={notification.id}>
            <time>{formatDate(notification.createdAt)}</time>
          </MenuItem>
        );
      })
    );

  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      {notificationContent}
    </Menu>
  );
}

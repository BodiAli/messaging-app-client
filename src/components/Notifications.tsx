import { Menu } from "@mui/material";
import { useGetNotificationsQuery } from "@/slices/notificationsSlice";
import isUnauthorized from "@/utils/isUnauthorized";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import Loader from "./Loader/Loader";
import NotificationItem from "./NotificationItem";

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

  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      {data.notifications.length > 0 ? (
        data.notifications.map((notification) => {
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          );
        })
      ) : (
        <p>No current notifications</p>
      )}
    </Menu>
  );
}

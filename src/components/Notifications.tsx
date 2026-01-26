import { Menu, MenuItem } from "@mui/material";
import {
  useGetNotificationsQuery,
  useRejectGroupInviteMutation,
} from "@/slices/notificationsSlice";
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
    error: queryError,
  } = useGetNotificationsQuery(undefined);
  const [rejectGroupInvite, { error: rejectGroupInviteError }] =
    useRejectGroupInviteMutation();

  const error = queryError ?? rejectGroupInviteError;

  function handleRejectGroupInvite(groupId: string) {
    return () => {
      void rejectGroupInvite(groupId);
    };
  }

  if (error && !isUnauthorized(error)) {
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
              onDeclineClick={undefined}
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
              onDeclineClick={handleRejectGroupInvite}
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

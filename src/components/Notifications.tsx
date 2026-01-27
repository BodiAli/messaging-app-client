import { Menu, MenuItem } from "@mui/material";
import {
  useAcceptFriendRequestMutation,
  useAcceptGroupInviteMutation,
  useDeclineFriendRequestMutation,
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
  const [declineFriendRequest, { error: declineFriendRequestError }] =
    useDeclineFriendRequestMutation();
  const [acceptGroupInvite, { error: acceptGroupInviteError }] =
    useAcceptGroupInviteMutation();
  const [acceptFriendRequest, { error: acceptFriendRequestError }] =
    useAcceptFriendRequestMutation();

  const error =
    queryError ??
    rejectGroupInviteError ??
    acceptGroupInviteError ??
    declineFriendRequestError ??
    acceptFriendRequestError;

  if (error && !isUnauthorized(error)) {
    handleUnexpectedError(error);
  }

  function handleAcceptInvite(
    id: string,
    type: "GROUP_INVITATION" | "FRIEND_REQUEST",
  ) {
    return () => {
      switch (type) {
        case "GROUP_INVITATION": {
          void acceptGroupInvite(id);
          return;
        }
        case "FRIEND_REQUEST": {
          void acceptFriendRequest(id);
          return;
        }
      }
    };
  }

  function handleDeclineInvite(
    id: string,
    type: "GROUP_INVITATION" | "FRIEND_REQUEST",
  ) {
    return () => {
      switch (type) {
        case "GROUP_INVITATION": {
          void rejectGroupInvite(id);
          return;
        }
        case "FRIEND_REQUEST": {
          void declineFriendRequest(id);
          return;
        }
      }
    };
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
              onAcceptClick={undefined}
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
              onDeclineClick={handleDeclineInvite}
              onAcceptClick={handleAcceptInvite}
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

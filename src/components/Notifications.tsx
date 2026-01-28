import { useState } from "react";
import { useSnackbar } from "notistack";
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
import {
  isClientError,
  isFetchBaseQueryError,
  isServerError,
  type ApiClientError,
} from "@/types/apiResponseTypes";
import NotificationItem from "./NotificationItem";

const NOTIFICATION_SKELETONS = ["SKELETON1", "SKELETON2"];

function handleNotificationError(error: unknown): string | ApiClientError {
  if (!isFetchBaseQueryError(error)) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    return String(error);
  }

  if (isClientError(error.data)) {
    return error.data;
  }

  if (isServerError(error.data)) {
    return error.data.error;
  }

  if (typeof error.status === "string") {
    return error.error;
  }

  return String(error.data);
}

export default function Notifications({
  open,
  anchorElement,
  onClose,
}: {
  open: boolean;
  anchorElement: HTMLButtonElement;
  onClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [fatalError, setFatalError] = useState<{ error: string } | null>(null);
  const {
    data = { notifications: [] },
    isLoading,
    error: queryError,
  } = useGetNotificationsQuery(undefined);
  const [rejectGroupInvite, { isLoading: isRejectGroupInviteLoading }] =
    useRejectGroupInviteMutation();
  const [declineFriendRequest, { isLoading: isDeclineFriendRequestLoading }] =
    useDeclineFriendRequestMutation();
  const [acceptGroupInvite, { isLoading: isAcceptGroupInviteLoading }] =
    useAcceptGroupInviteMutation();
  const [acceptFriendRequest, { isLoading: isAcceptFriendRequestLoading }] =
    useAcceptFriendRequestMutation();

  const mutationLoading =
    isRejectGroupInviteLoading ||
    isDeclineFriendRequestLoading ||
    isAcceptGroupInviteLoading ||
    isAcceptFriendRequestLoading;

  if (queryError && !isUnauthorized(queryError)) {
    handleUnexpectedError(queryError);
  }

  if (fatalError) {
    throw new Error(fatalError.error);
  }

  function handleAcceptInvite(
    id: string,
    type: "GROUP_INVITATION" | "FRIEND_REQUEST",
  ) {
    return async () => {
      try {
        switch (type) {
          case "GROUP_INVITATION":
            {
              await acceptGroupInvite(id).unwrap();
            }
            return;
          case "FRIEND_REQUEST": {
            await acceptFriendRequest(id).unwrap();
            return;
          }
        }
      } catch (error) {
        const errorResult = handleNotificationError(error);

        if (typeof errorResult === "string") {
          setFatalError({ error: errorResult });
          return;
        }

        errorResult.errors.forEach((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
      }
    };
  }

  function handleDeclineInvite(
    id: string,
    type: "GROUP_INVITATION" | "FRIEND_REQUEST",
  ) {
    return async () => {
      try {
        switch (type) {
          case "GROUP_INVITATION": {
            await rejectGroupInvite(id).unwrap();
            return;
          }
          case "FRIEND_REQUEST": {
            await declineFriendRequest(id).unwrap();

            return;
          }
        }
      } catch (error) {
        const errorResult = handleNotificationError(error);

        if (typeof errorResult === "string") {
          setFatalError({ error: errorResult });
          return;
        }

        errorResult.errors.forEach((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
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
              mutationLoading={mutationLoading}
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
              mutationLoading={mutationLoading}
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

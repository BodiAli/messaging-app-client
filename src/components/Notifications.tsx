import { Menu } from "@mui/material";
import { useGetNotificationsQuery } from "@/slices/notificationsSlice";
import isUnauthorized from "@/utils/isUnauthorized";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
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
  const { data, isLoading, error, isError } =
    useGetNotificationsQuery(undefined);

  if (isLoading) return <Loader />;

  if (isError && !isUnauthorized(error)) {
    handleUnexpectedError(error);
  }

  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      <li>Notifications</li>
      {data?.notifications.length === 0 && <p>No current notifications</p>}
    </Menu>
  );
}

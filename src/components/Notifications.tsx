import { Menu } from "@mui/material";
import { useGetNotificationsQuery } from "@/slices/notificationsSlice";
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
  const { data, isLoading, error } = useGetNotificationsQuery(undefined);

  if (isLoading) return <Loader />;

  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      <li>Notifications</li>
      {data?.notifications.length === 0 && <p>No current notifications</p>}
    </Menu>
  );
}

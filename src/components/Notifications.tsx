import { Menu } from "@mui/material";

export default function Notifications({
  open,
  anchorElement,
  onClose,
}: {
  open: boolean;
  anchorElement: HTMLButtonElement;
  onClose: () => void;
}) {
  return (
    <Menu onClose={onClose} open={open} anchorEl={anchorElement}>
      <li>Notifications</li>
    </Menu>
  );
}

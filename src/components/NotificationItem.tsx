import type { UserNotifications } from "@/types/userNotifications";

type Flatten<Type> = Type extends (infer Item)[] ? Item : Type;

export default function NotificationItem({
  notification,
}: {
  notification: Flatten<UserNotifications["notifications"]>;
}) {}

import { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/notifications-page";

export const metadata: Metadata = {
  title: "Bildirishnomalar | Darslinker",
  description: "Sizning bildirishnomalaringiz",
};

export default function NotificationsRoute() {
  return <NotificationsPage />;
}

import type { Metadata } from "next";
import { NotificationsForm } from "./NotificationsForm";

export const metadata: Metadata = {
  title: "Notification Preferences | ReviewIQ",
  description:
    "Manage your ReviewIQ notification settings — price alerts, review notifications, and weekly digest preferences.",
  robots: { index: false, follow: false },
};

export default function NotificationsSettingsPage() {
  return <NotificationsForm />;
}

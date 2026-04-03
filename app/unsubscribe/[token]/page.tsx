import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/email/tokens";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  price_alerts: "price drop alerts",
  review_alerts: "new review notifications",
  weekly_digest: "weekly digest emails",
};

const EMAIL_TYPE_FIELDS: Record<string, "priceAlerts" | "reviewAlerts" | "weeklyDigest"> = {
  price_alerts: "priceAlerts",
  review_alerts: "reviewAlerts",
  weekly_digest: "weeklyDigest",
};

export default async function UnsubscribePage({ params }: Props) {
  const { token } = await params;

  // Try signed token first (user-level notification preferences)
  const verified = verifyToken(token);
  if (verified) {
    const field = EMAIL_TYPE_FIELDS[verified.emailType];
    if (field) {
      await prisma.notificationPreference.upsert({
        where: { userId: verified.userId },
        update: { [field]: false },
        create: { userId: verified.userId, [field]: false },
      });

      return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribed</h1>
          <p className="text-gray-600">
            You have been unsubscribed from{" "}
            <strong>{EMAIL_TYPE_LABELS[verified.emailType] || verified.emailType}</strong>.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            You can re-enable notifications anytime from your{" "}
            <a href="/settings/notifications" className="text-indigo-600 hover:text-indigo-700 underline">
              notification settings
            </a>.
          </p>
        </div>
      );
    }
  }

  // Fall back to product-level EmailSubscription token
  const subscription = await prisma.emailSubscription.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscription) notFound();

  if (!subscription.unsubscribedAt) {
    await prisma.emailSubscription.update({
      where: { id: subscription.id },
      data: { unsubscribedAt: new Date() },
    });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribed</h1>
      <p className="text-gray-600">
        You have been unsubscribed from SmartScore updates for{" "}
        <strong>{subscription.productName}</strong>. You will no longer receive
        notifications about score changes.
      </p>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function UnsubscribePage({ params }: Props) {
  const { token } = await params;

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

import { prisma } from "./prisma";
import type { PlanKey } from "./stripe";

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.status !== "active") {
    return { plan: "free" as PlanKey, isActive: false, subscription: null };
  }

  return {
    plan: subscription.plan as PlanKey,
    isActive: true,
    subscription,
  };
}

export async function hasProAccess(userId: string): Promise<boolean> {
  const { plan, isActive } = await getUserSubscription(userId);
  return plan === "pro" && isActive;
}

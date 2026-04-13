import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ plan: "free", isActive: false });
    }

    const userId = (session.user as { id: string }).id;
    const status = await getUserSubscription(userId);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to fetch subscription status:", error);
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 });
  }
}

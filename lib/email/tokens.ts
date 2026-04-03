import crypto from "crypto";

const SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "smartreview-email-secret";

export function signToken(userId: string, emailType: string): string {
  const payload = `${userId}:${emailType}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const data = Buffer.from(payload).toString("base64url");
  return `${data}.${hmac}`;
}

export function verifyToken(token: string): { userId: string; emailType: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, hmac] = parts;
  try {
    const payload = Buffer.from(data, "base64url").toString();
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) return null;
    const [userId, emailType] = payload.split(":");
    if (!userId || !emailType) return null;
    return { userId, emailType };
  } catch {
    return null;
  }
}

import { Resend } from "resend";
import { signToken } from "./tokens";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function unsubscribeUrl(userId: string, emailType: string): string {
  const token = signToken(userId, emailType);
  return `${SITE_URL}/unsubscribe/${token}`;
}

function baseLayout(content: string, userId: string, emailType: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0;">ReviewIQ</h1>
  </div>
  <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    ${content}
  </div>
  <div style="text-align:center;margin-top:24px;padding-top:16px;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      <a href="${SITE_URL}/settings/notifications" style="color:#6366f1;text-decoration:underline;">Manage preferences</a>
      &nbsp;|&nbsp;
      <a href="${unsubscribeUrl(userId, emailType)}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
    </p>
    <p style="color:#d1d5db;font-size:11px;margin-top:8px;">ReviewIQ &mdash; Real Reviews, Real Intelligence</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendPriceDropAlert(params: {
  userId: string;
  email: string;
  productName: string;
  productSlug: string;
  oldPrice: number;
  newPrice: number;
  categorySlug: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const savings = params.oldPrice - params.newPrice;
  const productUrl = `${SITE_URL}/products/${params.categorySlug}/${params.productSlug}`;

  const content = `
    <h2 style="font-size:18px;color:#111827;margin:0 0 8px;">Price Drop Alert</h2>
    <p style="color:#4b5563;font-size:14px;margin:0 0 16px;">
      Great news! A product on your watchlist just dropped in price.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:16px;">
      <p style="font-weight:600;color:#111827;font-size:16px;margin:0 0 8px;">${params.productName}</p>
      <p style="margin:0;">
        <span style="color:#9ca3af;text-decoration:line-through;font-size:14px;">$${params.oldPrice}</span>
        <span style="color:#16a34a;font-weight:700;font-size:18px;margin-left:8px;">$${params.newPrice}</span>
        <span style="background:#dcfce7;color:#15803d;font-size:12px;padding:2px 8px;border-radius:99px;margin-left:8px;">Save $${savings}</span>
      </p>
    </div>
    <a href="${productUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Product</a>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: `Price drop: ${params.productName} is now $${params.newPrice}`,
      html: baseLayout(content, params.userId, "price_alerts"),
    });
    return true;
  } catch (err) {
    console.error("Failed to send price drop alert:", err);
    return false;
  }
}

export async function sendNewReviewAlert(params: {
  userId: string;
  email: string;
  productName: string;
  productSlug: string;
  categorySlug: string;
  reviewerName: string;
  rating: number;
  headline: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const stars = "★".repeat(params.rating) + "☆".repeat(5 - params.rating);
  const productUrl = `${SITE_URL}/products/${params.categorySlug}/${params.productSlug}`;

  const content = `
    <h2 style="font-size:18px;color:#111827;margin:0 0 8px;">New Review Posted</h2>
    <p style="color:#4b5563;font-size:14px;margin:0 0 16px;">
      Someone just reviewed a product you're watching.
    </p>
    <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin-bottom:16px;">
      <p style="font-weight:600;color:#111827;font-size:16px;margin:0 0 4px;">${params.productName}</p>
      <p style="color:#7c3aed;font-size:14px;margin:0 0 8px;">${stars}</p>
      <p style="color:#4b5563;font-size:14px;margin:0;font-style:italic;">"${params.headline}"</p>
      <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">by ${params.reviewerName}</p>
    </div>
    <a href="${productUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Read Full Review</a>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: `New review on ${params.productName}: "${params.headline}"`,
      html: baseLayout(content, params.userId, "review_alerts"),
    });
    return true;
  } catch (err) {
    console.error("Failed to send review alert:", err);
    return false;
  }
}

export async function sendWeeklyDigest(params: {
  userId: string;
  email: string;
  userName: string;
  topReviews: Array<{ productName: string; productSlug: string; categorySlug: string; rating: number; headline: string }>;
  trendingProducts: Array<{ name: string; slug: string; categorySlug: string; smartScore: number }>;
  priceDrops: Array<{ productName: string; productSlug: string; categorySlug: string; oldPrice: number; newPrice: number }>;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const reviewItems = params.topReviews.slice(0, 5).map((r) => {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    return `<li style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
      <a href="${SITE_URL}/products/${r.categorySlug}/${r.productSlug}" style="color:#4f46e5;text-decoration:none;font-weight:500;">${r.productName}</a>
      <span style="color:#7c3aed;margin-left:8px;">${stars}</span>
      <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">${r.headline}</p>
    </li>`;
  }).join("");

  const trendingItems = params.trendingProducts.slice(0, 5).map((p) =>
    `<li style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
      <a href="${SITE_URL}/products/${p.categorySlug}/${p.slug}" style="color:#4f46e5;text-decoration:none;font-weight:500;">${p.name}</a>
      <span style="background:#dbeafe;color:#1d4ed8;font-size:11px;padding:2px 6px;border-radius:99px;margin-left:8px;">Score: ${p.smartScore}</span>
    </li>`
  ).join("");

  const priceDropItems = params.priceDrops.slice(0, 3).map((d) =>
    `<li style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
      <a href="${SITE_URL}/products/${d.categorySlug}/${d.productSlug}" style="color:#4f46e5;text-decoration:none;font-weight:500;">${d.productName}</a>
      <span style="color:#9ca3af;text-decoration:line-through;font-size:12px;margin-left:8px;">$${d.oldPrice}</span>
      <span style="color:#16a34a;font-weight:600;margin-left:4px;">$${d.newPrice}</span>
    </li>`
  ).join("");

  const content = `
    <h2 style="font-size:18px;color:#111827;margin:0 0 4px;">Your Weekly Digest</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      Hi ${params.userName || "there"}, here's what happened this week on ReviewIQ.
    </p>
    ${reviewItems ? `
    <h3 style="font-size:15px;color:#111827;margin:0 0 8px;">Top New Reviews</h3>
    <ul style="list-style:none;padding:0;margin:0 0 24px;">${reviewItems}</ul>` : ""}
    ${trendingItems ? `
    <h3 style="font-size:15px;color:#111827;margin:0 0 8px;">Trending Products</h3>
    <ul style="list-style:none;padding:0;margin:0 0 24px;">${trendingItems}</ul>` : ""}
    ${priceDropItems ? `
    <h3 style="font-size:15px;color:#111827;margin:0 0 8px;">Price Drops This Week</h3>
    <ul style="list-style:none;padding:0;margin:0 0 24px;">${priceDropItems}</ul>` : ""}
    <a href="${SITE_URL}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Explore ReviewIQ</a>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "Your ReviewIQ Weekly Digest",
      html: baseLayout(content, params.userId, "weekly_digest"),
    });
    return true;
  } catch (err) {
    console.error("Failed to send weekly digest:", err);
    return false;
  }
}

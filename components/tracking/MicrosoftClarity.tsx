"use client";

/**
 * Microsoft Clarity session-analytics loader.
 *
 * Loaded via next/script with strategy="lazyOnload" so it runs AFTER the page
 * is interactive — session-recording analytics never needs to execute before
 * LCP/hydration, and deferring it keeps third-party JS out of the critical
 * path (better LCP/INP/TBT). Mirrors the GTM/MetaPixel pattern.
 *
 * Env var: NEXT_PUBLIC_CLARITY_ID (defaults to the existing project id so prod
 * behavior is unchanged; same default used in app/api/analytics/route.ts).
 */

import Script from "next/script";

export function MicrosoftClarity() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || "w3w5leh6ae";
  if (!clarityId) return null;

  return (
    <Script
      id="ms-clarity-init"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`,
      }}
    />
  );
}

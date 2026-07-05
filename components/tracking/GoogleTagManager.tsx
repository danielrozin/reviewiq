"use client";

/**
 * Google Tag Manager container script.
 * Loads GTM and initializes dataLayer with GA4 + Google Ads config.
 *
 * Env vars:
 *   NEXT_PUBLIC_GTM_ID          - GTM container ID (e.g. GTM-XXXXXXX)
 *   NEXT_PUBLIC_GA_ID           - GA4 measurement ID (e.g. G-XXXXXXX)
 *   NEXT_PUBLIC_GOOGLE_ADS_ID   - Google Ads account ID (e.g. AW-XXXXXXX)
 */

import Script from "next/script";

export function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  // If GTM is configured, use it as the single tag loader
  if (gtmId) {
    return (
      <>
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      </>
    );
  }

  // Fallback: load GA4 and/or Google Ads directly via gtag.js
  const primaryId = gaId || adsId;
  if (!primaryId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaId ? `gtag('config', '${gaId}');` : ""}
            ${adsId ? `gtag('config', '${adsId}');` : ""}
          `,
        }}
      />
    </>
  );
}

/** GTM noscript iframe — place in <body> */
export function GoogleTagManagerNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        title="Google Tag Manager"
        aria-hidden="true"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

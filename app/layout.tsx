import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { organizationSchema, websiteSchema, analysisAuthorSchema, siteNavigationSchema } from "@/lib/schema/jsonld";
import { AppProvider } from "@/lib/context/AppContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SubscriptionProvider } from "@/lib/context/SubscriptionContext";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { OnboardingOrchestrator } from "@/components/onboarding/OnboardingOrchestrator";
import { ExperimentProvider } from "@/lib/experiments";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/tracking/GoogleTagManager";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { CompareProvider } from "@/lib/context/CompareContext";
import { ComparisonTray } from "@/components/comparison/ComparisonTray";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "ReviewIQ — Real Reviews, Real Intelligence",
  description:
    "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"
  ),
  openGraph: {
    title: "ReviewIQ — Real Reviews, Real Intelligence",
    description: "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.",
    siteName: "ReviewIQ",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w3w5leh6ae");`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand-600 focus:text-white focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-white focus:outline-none"
        >
          Skip to main content
        </a>
        <GoogleTagManager />
        <MetaPixel />
        <GoogleTagManagerNoScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema(), analysisAuthorSchema(), siteNavigationSchema()]),
          }}
        />
        <SessionProvider>
          <SubscriptionProvider>
            <AppProvider>
              <CompareProvider>
                <OnboardingProvider>
                  <ExperimentProvider>
                    <Header />
                    <OnboardingOrchestrator />
                    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none pb-14 lg:pb-0">{children}</main>
                    <Footer />
                    <ComparisonTray />
                    <ScrollToTop />
                    <MobileBottomNav />
                  </ExperimentProvider>
                </OnboardingProvider>
              </CompareProvider>
            </AppProvider>
          </SubscriptionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

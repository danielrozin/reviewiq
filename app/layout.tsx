import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { organizationSchema, websiteSchema } from "@/lib/schema/jsonld";
import { AppProvider } from "@/lib/context/AppContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/tracking/GoogleTagManager";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { SurveyPopup } from "@/components/survey/SurveyPopup";

export const metadata: Metadata = {
  title: "SmartReview — Real Reviews, Real Intelligence",
  description:
    "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
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
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || "w3w5leh6ae"}");`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <GoogleTagManager />
        <MetaPixel />
        <GoogleTagManagerNoScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />
        <SessionProvider>
          <AppProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <SurveyPopup />
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

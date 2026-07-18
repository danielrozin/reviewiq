import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In to ReviewIQ | Real Reviews, Real Intelligence",
  description:
    "Sign in to ReviewIQ to access your saved comparisons, watchlist, and personalized product recommendations.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInForm />;
}

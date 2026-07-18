import type { Metadata } from "next";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create Account | ReviewIQ — Real Reviews, Real Intelligence",
  description:
    "Create a free ReviewIQ account to write verified reviews, save product comparisons, and get personalized buying recommendations.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpForm />;
}

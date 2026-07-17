import type { Metadata } from "next";
import { UxStudyForm } from "./UxStudyForm";

export const metadata: Metadata = {
  title: "Join the ReviewIQ UX Study — Help Shape the Product",
  description:
    "Sign up for a free 30-minute usability session and give direct feedback on ReviewIQ. Your input shapes what we build next.",
  robots: { index: false, follow: false },
};

export default function UxStudyPage() {
  return <UxStudyForm />;
}

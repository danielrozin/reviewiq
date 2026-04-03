"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { useSession } from "next-auth/react";
import { Check, Circle, ChevronRight } from "lucide-react";

const CHECKLIST_ITEMS = [
  {
    key: "viewedProduct" as const,
    label: "View a product",
    description: "Explore a product page to see reviews & scores",
    href: "/products",
  },
  {
    key: "savedComparison" as const,
    label: "Save a comparison",
    description: "Compare two products and save it for later",
    href: "/products",
  },
  {
    key: "wroteReview" as const,
    label: "Write your first review",
    description: "Share your experience to help others decide",
    href: "/write-review",
  },
  {
    key: "joinedDiscussion" as const,
    label: "Join a discussion",
    description: "Ask a question or share your thoughts",
    href: "/community",
  },
];

export function ProfileChecklist() {
  const { state } = useOnboarding();
  const { status } = useSession();

  // Only show for authenticated users who haven't completed everything
  if (status !== "authenticated") return null;

  const completedCount = Object.values(state.checklist).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;

  // Hide if all items complete
  if (completedCount === totalCount) return null;

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Complete your profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-brand-600">{progressPercent}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {CHECKLIST_ITEMS.map((item) => {
          const done = state.checklist[item.key];
          return (
            <Link
              key={item.key}
              href={done ? "#" : item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                done
                  ? "bg-emerald-50/50 cursor-default"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  done
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-gray-200 text-gray-300"
                }`}
              >
                {done ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {item.label}
                </p>
                {!done && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
              {!done && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

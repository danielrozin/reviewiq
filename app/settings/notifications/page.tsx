"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface Preferences {
  priceAlerts: boolean;
  reviewAlerts: boolean;
  weeklyDigest: boolean;
}

type PrefKey = keyof Preferences;

const GROUPS = [
  {
    title: "Price & Deals",
    description: "Stay ahead of price changes on products you care about.",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H18M2.25 10.5H3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H2.25" />
      </svg>
    ),
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    toggleColor: "bg-amber-500",
    toggleRing: "focus-visible:ring-amber-500",
    toggles: [
      {
        key: "priceAlerts" as PrefKey,
        label: "Price Drop Alerts",
        description: "Get notified when a product on your watchlist drops in price.",
        badge: "Real-time",
      },
    ],
  },
  {
    title: "Community & Reviews",
    description: "Follow the conversation around products you're researching.",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    toggleColor: "bg-brand-600",
    toggleRing: "focus-visible:ring-brand-600",
    toggles: [
      {
        key: "reviewAlerts" as PrefKey,
        label: "New Review Alerts",
        description: "Get notified when new reviews are posted on products you watch.",
        badge: "Daily digest",
      },
    ],
  },
  {
    title: "Weekly Roundup",
    description: "A curated newsletter with insights you won't want to miss.",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    toggleColor: "bg-purple-600",
    toggleRing: "focus-visible:ring-purple-500",
    toggles: [
      {
        key: "weeklyDigest" as PrefKey,
        label: "Weekly Digest",
        description: "Top reviews, trending products, and price drops — delivered every Sunday.",
        badge: "Every Sunday",
      },
    ],
  },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((r) => (r.ok ? r.json() : Promise.reject("Failed to load")))
      .then(setPrefs)
      .catch(() => setError("Sign in to manage your notification preferences."));
  }, []);

  async function toggle(key: PrefKey) {
    if (!prefs) return;
    setSaving(key);
    const newVal = !prefs[key];
    setPrefs({ ...prefs, [key]: newVal });

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPrefs(data);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setPrefs({ ...prefs, [key]: !newVal });
    } finally {
      setSaving(null);
    }
  }

  const enabledCount = prefs ? Object.values(prefs).filter(Boolean).length : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Dashboard", url: "/dashboard" },
          { name: "Notifications", url: "/settings/notifications" },
        ]}
      />

      {/* Screen-reader live region for toggle save feedback */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {saved ? "Preference saved" : ""}
      </span>

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 text-sm mt-1">
              Control how and when ReviewIQ contacts you.
            </p>
          </div>
          {prefs && (
            <div className="shrink-0 ml-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                enabledCount > 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${enabledCount > 0 ? "bg-emerald-500" : "bg-gray-400"}`} />
                {enabledCount} of {Object.keys(prefs).length} active
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm mb-6">
          <svg aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      {!prefs && !error && (
        <div role="status" aria-label="Loading notification preferences" className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} aria-hidden="true" className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {prefs && (
        <div className="space-y-4">
          {GROUPS.map((group) => (
            <div key={group.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Group header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-50">
                <div aria-hidden="true" className={`w-9 h-9 rounded-xl ${group.iconBg} ${group.iconColor} flex items-center justify-center shrink-0`}>
                  {group.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{group.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{group.description}</p>
                </div>
              </div>

              {/* Toggles */}
              {group.toggles.map(({ key, label, description, badge }) => (
                <div key={key} className="flex items-center justify-between px-5 py-4 gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 text-sm">{label}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {badge}
                      </span>
                      {saved === key && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full animate-fade-in">
                          <svg aria-hidden="true" className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    disabled={saving === key}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 ${group.toggleRing} focus-visible:ring-offset-2 ${
                      prefs[key] ? group.toggleColor : "bg-gray-200"
                    } ${saving === key ? "opacity-50 cursor-not-allowed" : ""}`}
                    role="switch"
                    aria-checked={prefs[key]}
                    aria-label={label}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Delivery channel note */}
      {prefs && (
        <div className="mt-6 flex items-start gap-3 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
          <svg aria-hidden="true" className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs text-gray-600 leading-relaxed">
            All notifications are delivered to your account email. You can unsubscribe from any individual email using the link in the footer of each message.
          </p>
        </div>
      )}
    </div>
  );
}

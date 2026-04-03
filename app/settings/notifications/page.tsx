"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface Preferences {
  priceAlerts: boolean;
  reviewAlerts: boolean;
  weeklyDigest: boolean;
}

const TOGGLES: { key: keyof Preferences; label: string; description: string }[] = [
  {
    key: "priceAlerts",
    label: "Price Drop Alerts",
    description: "Get notified when a product on your watchlist drops in price.",
  },
  {
    key: "reviewAlerts",
    label: "New Review Alerts",
    description: "Get notified when new reviews are posted on products you watch.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly Digest",
    description: "A curated email with top reviews, trending products, and price drops.",
  },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((r) => (r.ok ? r.json() : Promise.reject("Failed to load")))
      .then(setPrefs)
      .catch(() => setError("Sign in to manage your notification preferences."));
  }, []);

  async function toggle(key: keyof Preferences) {
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
    } catch {
      setPrefs({ ...prefs, [key]: !newVal });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Dashboard", url: "/dashboard" },
          { name: "Notifications", url: "/settings/notifications" },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
        Email Notifications
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Choose which emails you'd like to receive from SmartReview.
      </p>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm mb-6">
          {error}
        </div>
      )}

      {!prefs && !error && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {prefs && (
        <div className="space-y-4">
          {TOGGLES.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="pr-4">
                <h3 className="font-medium text-gray-900">{label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                disabled={saving === key}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  prefs[key] ? "bg-indigo-600" : "bg-gray-200"
                } ${saving === key ? "opacity-50" : ""}`}
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
      )}

      <p className="text-xs text-gray-400 mt-6">
        You can also unsubscribe from any email using the link at the bottom of each message.
      </p>
    </div>
  );
}

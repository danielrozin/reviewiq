"use client";

import { useState, useRef, useEffect } from "react";
import { Smartphone, Monitor, Clock, CheckCircle } from "lucide-react";

const AVAIL_OPTIONS = ["mornings", "evenings", "weekends"] as const;
type AvailOption = typeof AVAIL_OPTIONS[number];

const DEVICE_OPTIONS = [
  { val: "mobile", label: "Mobile", Icon: Smartphone },
  { val: "desktop", label: "Desktop", Icon: Monitor },
  { val: "both", label: "Both", Icon: Smartphone },
] as const;
type DeviceOption = typeof DEVICE_OPTIONS[number]["val"];

export function UxStudyForm() {
  const [form, setForm] = useState({ name: "", email: "", available: "" as AvailOption | "", device: "" as DeviceOption | "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const availGroupRef = useRef<HTMLDivElement>(null);
  const deviceGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "done") successHeadingRef.current?.focus();
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.available || !form.device) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/ux-study-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error — please try again");
      setStatus("error");
    }
  }

  function handleAvailKeyDown(e: React.KeyboardEvent, idx: number) {
    const count = AVAIL_OPTIONS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next = (idx + 1) % count; }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); next = (idx - 1 + count) % count; }
    if (next >= 0) {
      setForm(f => ({ ...f, available: AVAIL_OPTIONS[next] }));
      availGroupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    }
  }

  function handleDeviceKeyDown(e: React.KeyboardEvent, idx: number) {
    const count = DEVICE_OPTIONS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next = (idx + 1) % count; }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); next = (idx - 1 + count) % count; }
    if (next >= 0) {
      setForm(f => ({ ...f, device: DEVICE_OPTIONS[next].val }));
      deviceGroupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    }
  }

  if (status === "done") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
        <div role="alert" className="max-w-md w-full text-center py-16">
          <CheckCircle aria-hidden="true" className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 ref={successHeadingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900 mb-2 focus-visible:outline-none">You&apos;re in!</h1>
          <p className="text-gray-600">
            Thanks for signing up, {form.name.split(" ")[0]}! We&apos;ll reach out to{" "}
            <strong>{form.email}</strong> to schedule your 30-minute session.
          </p>
          <p className="text-sm text-gray-500 mt-6">
            Sessions run via video call — no install required.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-16">
      <div className="max-w-lg mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Usability Study
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Help shape ReviewIQ
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Join a free 30-minute video session and give us feedback on the ReviewIQ
            experience. Your input directly influences what we build next.
          </p>
        </div>

        {/* What to expect */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { emoji: "⏱", title: "30 min", desc: "One-on-one session" },
            { emoji: "🎁", title: "Free", desc: "No purchase needed" },
            { emoji: "💡", title: "Impact", desc: "Shape the product" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div aria-hidden="true" className="text-2xl mb-1">{item.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label htmlFor="ux-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <input
              id="ux-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 motion-safe:transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="ux-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="ux-email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 motion-safe:transition-shadow"
            />
          </div>

          <fieldset className="border-0 p-0 m-0">
            <legend id="avail-legend" className="block text-sm font-medium text-gray-700 mb-2">
              When are you typically free?
            </legend>
            <div ref={availGroupRef} role="radiogroup" aria-labelledby="avail-legend" className="grid grid-cols-3 gap-2">
              {AVAIL_OPTIONS.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={form.available === opt}
                  tabIndex={form.available === opt || (form.available === "" && idx === 0) ? 0 : -1}
                  onClick={() => setForm(f => ({ ...f, available: opt }))}
                  onKeyDown={(e) => handleAvailKeyDown(e, idx)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${
                    form.available === opt
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Clock aria-hidden="true" className={`w-4 h-4 ${form.available === opt ? "text-indigo-600" : "text-gray-400"}`} />
                  <span className="capitalize">{opt}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0">
            <legend id="device-legend" className="block text-sm font-medium text-gray-700 mb-2">
              Which device do you primarily use?
            </legend>
            <div ref={deviceGroupRef} role="radiogroup" aria-labelledby="device-legend" className="grid grid-cols-3 gap-2">
              {DEVICE_OPTIONS.map(({ val, label, Icon }, idx) => (
                <button
                  key={val}
                  type="button"
                  role="radio"
                  aria-checked={form.device === val}
                  tabIndex={form.device === val || (form.device === "" && idx === 0) ? 0 : -1}
                  onClick={() => setForm(f => ({ ...f, device: val }))}
                  onKeyDown={(e) => handleDeviceKeyDown(e, idx)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${
                    form.device === val
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon aria-hidden="true" className={`w-4 h-4 ${form.device === val ? "text-indigo-600" : "text-gray-400"}`} />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {status === "error" && (
            <p role="alert" className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || !form.name || !form.email || !form.available || !form.device}
            aria-busy={status === "submitting"}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 motion-safe:transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
          >
            {status === "submitting" ? "Submitting…" : "Sign me up →"}
          </button>

          <p className="text-center text-xs text-gray-600">
            We&apos;ll only contact you about this study. No spam, ever.
          </p>
        </form>
      </div>
    </main>
  );
}

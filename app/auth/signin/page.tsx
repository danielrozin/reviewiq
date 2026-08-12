"use client";

import { signIn, getProviders } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Couldn't start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in failed during the callback. Please try again.",
  OAuthCreateAccount: "Couldn't create your account. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  Callback: "Sign-in failed. Please try again.",
  AccessDenied: "Access denied. You cancelled the Google sign-in.",
  CredentialsSignin: "Incorrect email or password.",
  Configuration: "Sign-in isn't configured yet. Please contact support.",
  default: "Something went wrong with sign-in. Please try again.",
};

function SignInError({ overrideError }: { overrideError?: string }) {
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("error");
    if (code) setError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default);
  }, [params]);

  const msg = overrideError || error;
  if (!msg) return null;
  return (
    <div role="alert" aria-live="assertive" className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
      {msg}
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getProviders().then((p) => {
      setGoogleEnabled(!!(p && "google" in p));
    });
  }, []);

  async function handleGoogle() {
    setLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setLoadingGoogle(false);
    }
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setFormLoading(false);
    if (result?.error) {
      setFormError(ERROR_MESSAGES.CredentialsSignin);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <Suspense fallback={null}>
        <SignInError overrideError={formError} />
      </Suspense>

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loadingGoogle ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleCredentials} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={formLoading}
          className="w-full px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {formLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" aria-label="ReviewIQ home" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">RIQ</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in to ReviewIQ</h1>
          <p className="mt-2 text-sm text-gray-500">
            Access your reviews, comparisons, and subscription.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />}>
          <SignInForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

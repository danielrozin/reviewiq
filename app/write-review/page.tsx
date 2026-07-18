"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { products } from "@/data/products";
import { trackReviewSubmitted, trackWriteReviewStep, trackReviewAuthGateShown } from "@/lib/tracking/analytics";

const experienceLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

const timeOwnedOptions = [
  "Less than 1 month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "1-2 years",
  "2+ years",
];

const verificationOptions = [
  { value: "receipt_upload", label: "I can upload a receipt" },
  { value: "email_receipt", label: "I have an email confirmation" },
  { value: "retailer_verified", label: "Purchased from a verified retailer" },
  { value: "user_declared", label: "I own this product (self-declared)" },
];

const STEPS = [
  { key: "product", label: "Product" },
  { key: "rating", label: "Rating" },
  { key: "review", label: "Review" },
  { key: "details", label: "Details" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: typeof STEPS }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? "\u2713" : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isCurrent ? "text-brand-600" : isCompleted ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                  isCompleted ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarRating({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <div role="group" aria-label="Star rating" className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          aria-pressed={star <= value}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className={`${sizeClass} transition-colors touch-manipulation ${
            star <= (hovered || value) ? "text-amber-400" : "text-gray-200"
          } hover:text-amber-300 active:scale-110`}
        >
          <span aria-hidden="true">&#9733;</span>
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-gray-500 self-center ml-2">{value}/5</span>
      )}
    </div>
  );
}

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

/**
 * Static, hook-free shell rendered as the SSR HTML and during the brief
 * client-side session-loading window. Gives crawlers and slow/JS-disabled
 * clients a well-formed page (headline + auth prompt + step indicator +
 * skeleton + noscript) instead of a bare spinner. See DAN-678.
 *
 * Layout intentionally mirrors the hydrated wizard (same Breadcrumbs,
 * headline, intro copy and StepIndicator at step 0) so the SSR -> hydrated
 * transition stays visually continuous and CLS-low.
 */
function WriteReviewShell() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "Write a Review", url: "/write-review" }]} />

      <div className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
        <p className="text-gray-500 mb-6">
          Share your honest experience to help others make smarter buying decisions.
        </p>

        {/* Auth prompt — visible before JS resolves the session */}
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Sign in to submit your review.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/auth/signin?callbackUrl=/write-review"
              className="inline-flex justify-center px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signin?callbackUrl=/write-review"
              className="inline-flex justify-center px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>

        <StepIndicator currentStep={0} steps={STEPS} />

        {/* Skeleton preview of the first step (Product + Headline) so visitors
            can gauge what's involved before the wizard hydrates. */}
        <div className="space-y-6" aria-hidden="true">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>

        <noscript>
          <div className="mt-6 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            Writing a review needs JavaScript enabled.{" "}
            <Link href="/products" className="text-brand-600 underline">
              Browse reviews instead &rarr;
            </Link>
          </div>
        </noscript>
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  const { data: session, status } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [selectedProduct, setSelectedProduct] = useState("");
  const [headline, setHeadline] = useState("");
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState(["", "", ""]);
  const [cons, setCons] = useState(["", "", ""]);
  const [body, setBody] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [timeOwned, setTimeOwned] = useState("");
  const [verification, setVerification] = useState("");
  const [reliabilityRating, setReliabilityRating] = useState(0);
  const [easeOfUseRating, setEaseOfUseRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Step validation
  const stepValid: Record<StepKey, boolean> = {
    product: !!selectedProduct && !!headline,
    rating: rating > 0 && reliabilityRating > 0 && easeOfUseRating > 0 && valueRating > 0,
    review: body.length >= 50,
    details: !!experienceLevel && !!timeOwned && !!verification,
  };

  const canProceed = stepValid[STEPS[step].key];

  const goNext = () => {
    if (canProceed && step < STEPS.length - 1) {
      trackWriteReviewStep(step + 1, STEPS[step].key);
      setStep(step + 1);
    }
  };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const reviewData = {
      productId: selectedProduct,
      headline,
      rating,
      reliabilityRating,
      easeOfUseRating,
      valueRating,
      experienceLevel,
      timeOwned,
      verification,
      pros: pros.filter((p) => p.trim()),
      cons: cons.filter((c) => c.trim()),
      body,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewData,
          userId: (session?.user as { id?: string })?.id || "anonymous",
          verifiedPurchase: verification !== "",
          verificationTier: verification || "unverified",
        }),
      });

      if (!res.ok) {
        const existing = JSON.parse(localStorage.getItem("pending_reviews") || "[]");
        existing.push(reviewData);
        localStorage.setItem("pending_reviews", JSON.stringify(existing));
      }

      trackReviewSubmitted(selectedProduct, rating);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Offline fallback
      const existing = JSON.parse(localStorage.getItem("pending_reviews") || "[]");
      existing.push(reviewData);
      localStorage.setItem("pending_reviews", JSON.stringify(existing));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePro = (index: number, value: string) => {
    const updated = [...pros];
    updated[index] = value;
    setPros(updated);
  };

  const updateCon = (index: number, value: string) => {
    const updated = [...cons];
    updated[index] = value;
    setCons(updated);
  };

  useEffect(() => {
    if (status !== "loading" && !session) {
      trackReviewAuthGateShown("", "page_load");
    }
  }, [session, status]);

  // Auth gate: require sign-in to write reviews.
  // The loading state is also what gets server-rendered as the initial HTML,
  // so render the full static shell (not a bare spinner) for crawlers and
  // slow/JS-disabled clients. See DAN-678.
  if (status === "loading") {
    return <WriteReviewShell />;
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: "Write a Review", url: "/write-review" }]} />
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg aria-hidden="true" className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to write a review
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Create a free account to share your experience and help others make smarter buying decisions. Your reviews earn reputation and build trust.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/write-review"
            className="inline-flex px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Sign in to continue
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Free account — takes less than 30 seconds
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-emerald-600 text-2xl">&#10003;</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your review!
          </h1>
          <p className="text-gray-500 leading-relaxed mb-2">
            Your review has been submitted and will be processed by our team.
            We verify all reviews before publishing to maintain trust and
            quality.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Reviews typically appear within 24-48 hours after verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/write-review"
              onClick={(e) => { e.preventDefault(); setSubmitted(false); setStep(0); setSelectedProduct(""); setHeadline(""); setRating(0); setBody(""); setPros(["","",""]); setCons(["","",""]); setExperienceLevel(""); setTimeOwned(""); setVerification(""); setReliabilityRating(0); setEaseOfUseRating(0); setValueRating(0); setTouched({}); }}
              className="inline-flex px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Write Another Review
            </a>
            <a
              href="/community"
              className="inline-flex px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Join the Community
            </a>
            <a
              href="/products"
              className="inline-flex px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Explore Products
            </a>
          </div>
          <Link
            href="/"
            className="inline-flex mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "Write a Review", url: "/write-review" }]} />

      <div className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Write a Review
        </h1>
        <p className="text-gray-500 mb-6">
          Share your honest experience to help others make smarter buying decisions.
        </p>

        <StepIndicator currentStep={step} steps={STEPS} />

        {/* Step 1: Product & Headline */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label htmlFor="wr-product" className="block text-sm font-semibold text-gray-900 mb-2">
                Product *
              </label>
              <select
                id="wr-product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                onBlur={() => markTouched("product")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} — {p.name}
                  </option>
                ))}
              </select>
              <FieldError
                show={touched.product === true && !selectedProduct}
                message="Please select a product"
              />
            </div>

            <div>
              <label htmlFor="wr-headline" className="block text-sm font-semibold text-gray-900 mb-2">
                Review Headline *
              </label>
              <input
                id="wr-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                onBlur={() => markTouched("headline")}
                placeholder="Summarize your experience in one sentence"
                maxLength={120}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <div className="flex justify-between mt-1">
                <FieldError
                  show={touched.headline === true && !headline}
                  message="Headline is required"
                />
                <p className="text-xs text-gray-400">{headline.length}/120</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ratings */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Overall Rating *
              </label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Category Ratings
              </p>
              {[
                { label: "Reliability", value: reliabilityRating, setter: setReliabilityRating },
                { label: "Ease of Use", value: easeOfUseRating, setter: setEaseOfUseRating },
                { label: "Value for Money", value: valueRating, setter: setValueRating },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <StarRating value={value} onChange={setter} size="sm" />
                </div>
              ))}
            </div>

            {touched.rating && !stepValid.rating && (
              <p className="text-xs text-red-500">Please rate all categories</p>
            )}
          </div>
        )}

        {/* Step 3: Review Content */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label htmlFor="wr-body" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Review *
              </label>
              <textarea
                id="wr-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={() => markTouched("body")}
                placeholder="Share your honest experience. What surprised you? What disappointed you? Would you buy it again?"
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
              <p className={`text-xs mt-1 ${body.length >= 50 ? "text-emerald-500" : "text-gray-400"}`}>
                {body.length}/50 minimum characters
                {body.length >= 50 && " \u2713"}
              </p>
            </div>

            {/* Pros */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Pros (optional)
              </label>
              <div className="space-y-2">
                {pros.map((pro, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-emerald-500 shrink-0 text-lg">+</span>
                    <input
                      type="text"
                      aria-label={`Pro ${i + 1}`}
                      value={pro}
                      onChange={(e) => updatePro(i, e.target.value)}
                      placeholder={`Pro ${i + 1}`}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-2">
                Cons (optional)
              </label>
              <div className="space-y-2">
                {cons.map((con, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-red-400 shrink-0 text-lg">-</span>
                    <input
                      type="text"
                      aria-label={`Con ${i + 1}`}
                      value={con}
                      onChange={(e) => updateCon(i, e.target.value)}
                      placeholder={`Con ${i + 1}`}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Details & Verification */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wr-experience-level" className="block text-sm font-semibold text-gray-900 mb-2">
                  Experience Level *
                </label>
                <select
                  id="wr-experience-level"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  onBlur={() => markTouched("experienceLevel")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <FieldError
                  show={touched.experienceLevel === true && !experienceLevel}
                  message="Please select your experience level"
                />
              </div>
              <div>
                <label htmlFor="wr-time-owned" className="block text-sm font-semibold text-gray-900 mb-2">
                  Time Owned *
                </label>
                <select
                  id="wr-time-owned"
                  value={timeOwned}
                  onChange={(e) => setTimeOwned(e.target.value)}
                  onBlur={() => markTouched("timeOwned")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {timeOwnedOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <FieldError
                  show={touched.timeOwned === true && !timeOwned}
                  message="Please select how long you've owned it"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Purchase Verification *
              </label>
              <div className="space-y-2">
                {verificationOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      verification === opt.value
                        ? "border-brand-300 bg-brand-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="verification"
                      value={opt.value}
                      checked={verification === opt.value}
                      onChange={(e) => setVerification(e.target.value)}
                      className="accent-brand-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                canProceed
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          ) : (
            <div className="text-right">
              {submitError && (
                <p className="text-sm text-red-600 mb-2">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  canProceed && !isSubmitting
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Your review will be verified before publishing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

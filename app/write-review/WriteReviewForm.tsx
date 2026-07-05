"use client";

import { useState, useEffect, useRef } from "react";
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
    <div role="list" aria-label="Review steps" className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.key} role="listitem" className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${step.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : <span aria-hidden="true">{i + 1}</span>}
              </div>
              <span
                aria-hidden="true"
                className={`text-xs mt-1 font-medium ${
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
  const groupRef = useRef<HTMLDivElement>(null);
  const iconSize = size === "lg" ? "w-9 h-9" : "w-6 h-6";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, (value || 0) + 1);
      onChange(next);
      (groupRef.current?.querySelector(`[data-star="${next}"]`) as HTMLElement)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (value || 2) - 1);
      onChange(prev);
      (groupRef.current?.querySelector(`[data-star="${prev}"]`) as HTMLElement)?.focus();
    }
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          data-star={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all touch-manipulation active:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 rounded ${
            star <= (hovered || value) ? "text-amber-600 scale-105" : "text-gray-400"
          } hover:text-amber-500`}
          aria-label={`${star} out of 5 stars`}
        >
          <svg aria-hidden="true" className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 00.95-.69l1.285-3.958z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm font-medium text-amber-600 self-center ml-2" aria-hidden="true">{value}/5</span>
      )}
    </div>
  );
}

function FieldError({ id, show, message }: { id: string; show: boolean; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-xs mt-1 ${show ? "text-red-600" : "sr-only"}`}
    >
      {show ? message : ""}
    </p>
  );
}

export function WriteReviewForm() {
  const { data: session, status } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    stepContainerRef.current?.focus();
  }, [step]);

  useEffect(() => { if (submitted) successRef.current?.focus(); }, [submitted]);

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

  // Auth gate: require sign-in to write reviews
  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" role="status" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: "Write a Review", url: "/write-review" }]} />
        <div className="max-w-lg mx-auto text-center py-16">
          <div aria-hidden="true" className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg aria-hidden="true" className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to write a review
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Create a free account to share your experience and help others make smarter buying decisions. Your reviews earn reputation and build trust.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/write-review"
            className="inline-flex px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            Sign in to continue
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Free account — takes less than 30 seconds
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    function handleReset(e: React.MouseEvent) {
      e.preventDefault();
      setSubmitted(false); setStep(0); setSelectedProduct(""); setHeadline(""); setRating(0); setBody(""); setPros(["","",""]); setCons(["","",""]); setExperienceLevel(""); setTimeOwned(""); setVerification(""); setReliabilityRating(0); setEaseOfUseRating(0); setValueRating(0); setTouched({});
    }

    return (
      <div ref={successRef} role="status" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto py-16">
          {/* Success card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-10 text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div aria-hidden="true" className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg aria-hidden="true" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span aria-hidden="true" className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              Review submitted!
            </h1>
            <p className="text-gray-600 leading-relaxed mb-1">
              Your review has been queued for verification. We check every review before publishing to keep the data honest.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Typically live within 24–48 hours.
            </p>

            {/* Stats earned */}
            <div className="flex items-center justify-center gap-6 py-4 border-t border-emerald-100">
              {[
                {
                  icon: <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
                  label: "+10 reputation",
                },
                {
                  icon: <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
                  label: "Verified contributor",
                },
                {
                  icon: <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
                  label: "Helped future buyers",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <span aria-hidden="true" className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-sm border border-emerald-100">{item.icon}</span>
                  <span className="text-xs font-medium text-emerald-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/write-review"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              Write Another Review
            </a>
            <a
              href="/community"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              Join the Community
            </a>
            <a
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              Explore Products
            </a>
          </div>
          <div className="text-center mt-4">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "Write a Review", url: "/write-review" }]} />

      <div role="form" aria-labelledby="write-review-heading" className="mt-8 max-w-2xl">
        <h1 id="write-review-heading" className="text-3xl font-bold text-gray-900 mb-2">
          Write a Review
        </h1>
        <p data-speakable="write-review-intro" className="text-gray-600 mb-6">
          Share your honest experience to help others make smarter buying decisions.
        </p>

        <StepIndicator currentStep={step} steps={STEPS} />

        {/* Step 1: Product & Headline */}
        {step === 0 && (
          <div ref={stepContainerRef} tabIndex={-1} aria-label="Step 1 of 4: Select product and write a headline" className="space-y-6 animate-in fade-in duration-200 focus:outline-none">
            <div>
              <label htmlFor="select-product" className="block text-sm font-semibold text-gray-900 mb-2">
                Product *
              </label>
              <select
                id="select-product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                onBlur={() => markTouched("product")}
                aria-describedby="error-product"
                aria-required="true"
                aria-invalid={touched.product === true && !selectedProduct ? true : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} — {p.name}
                  </option>
                ))}
              </select>
              <FieldError
                id="error-product"
                show={touched.product === true && !selectedProduct}
                message="Please select a product"
              />
            </div>

            <div>
              <label htmlFor="input-headline" className="block text-sm font-semibold text-gray-900 mb-2">
                Review Headline *
              </label>
              <input
                id="input-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                onBlur={() => markTouched("headline")}
                placeholder="Summarize your experience in one sentence"
                maxLength={120}
                aria-describedby="error-headline"
                aria-required="true"
                aria-invalid={touched.headline === true && !headline ? true : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
              <div className="flex justify-between mt-1">
                <FieldError
                  id="error-headline"
                  show={touched.headline === true && !headline}
                  message="Headline is required"
                />
                <p className="text-xs text-gray-600">{headline.length}/120</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ratings */}
        {step === 1 && (
          <div ref={stepContainerRef} tabIndex={-1} aria-label="Step 2 of 4: Rate the product" className="space-y-6 animate-in fade-in duration-200 focus:outline-none">
            <fieldset aria-describedby="error-ratings" className="border-0 p-0 m-0">
              <legend className="block text-sm font-semibold text-gray-900 mb-3">
                Overall Rating *
              </legend>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </fieldset>

            <div role="group" aria-labelledby="category-ratings-label" className="bg-white border border-gray-100 rounded-xl p-4 space-y-4">
              <p id="category-ratings-label" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Category Ratings
              </p>
              {[
                { label: "Reliability", value: reliabilityRating, setter: setReliabilityRating },
                { label: "Ease of Use", value: easeOfUseRating, setter: setEaseOfUseRating },
                { label: "Value for Money", value: valueRating, setter: setValueRating },
              ].map(({ label, value, setter }) => {
                const id = `rating-label-${label.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <div key={label} role="group" aria-labelledby={id} className="flex items-center justify-between">
                    <span id={id} className="text-sm font-medium text-gray-700">{label}</span>
                    <StarRating value={value} onChange={setter} size="sm" />
                  </div>
                );
              })}
            </div>

            <p
              id="error-ratings"
              role="alert"
              aria-live="polite"
              className={`text-xs ${touched.rating && !stepValid.rating ? "text-red-600" : "sr-only"}`}
            >
              {touched.rating && !stepValid.rating ? "Please rate all categories before continuing" : ""}
            </p>
          </div>
        )}

        {/* Step 3: Review Content */}
        {step === 2 && (
          <div ref={stepContainerRef} tabIndex={-1} aria-label="Step 3 of 4: Write your review" className="space-y-6 animate-in fade-in duration-200 focus:outline-none">
            <div>
              <label htmlFor="textarea-body" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Review *
              </label>
              <textarea
                id="textarea-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={() => markTouched("body")}
                placeholder="Share your honest experience. What surprised you? What disappointed you? Would you buy it again?"
                rows={6}
                aria-required="true"
                aria-invalid={touched.body === true && body.length < 50 ? true : undefined}
                aria-describedby="body-char-count"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-none"
              />
              <p id="body-char-count" className={`text-xs mt-1 ${body.length >= 50 ? "text-emerald-600" : "text-gray-600"}`}>
                {body.length}/50 minimum characters
                {body.length >= 50 && " ✓"}
              </p>
            </div>

            {/* Pros */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="block text-sm font-semibold text-emerald-700 mb-2">
                Pros (optional)
              </legend>
              <div className="space-y-2">
                {pros.map((pro, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <svg aria-hidden="true" className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => updatePro(i, e.target.value)}
                      aria-label={`Pro ${i + 1}`}
                      placeholder={`Pro ${i + 1}`}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Cons */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="block text-sm font-semibold text-red-600 mb-2">
                Cons (optional)
              </legend>
              <div className="space-y-2">
                {cons.map((con, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <svg aria-hidden="true" className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => updateCon(i, e.target.value)}
                      aria-label={`Con ${i + 1}`}
                      placeholder={`Con ${i + 1}`}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* Step 4: Details & Verification */}
        {step === 3 && (
          <div ref={stepContainerRef} tabIndex={-1} aria-label="Step 4 of 4: Add details and verify your purchase" className="space-y-6 animate-in fade-in duration-200 focus:outline-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="select-experience" className="block text-sm font-semibold text-gray-900 mb-2">
                  Experience Level *
                </label>
                <select
                  id="select-experience"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  onBlur={() => markTouched("experienceLevel")}
                  aria-describedby="error-experienceLevel"
                  aria-required="true"
                  aria-invalid={touched.experienceLevel === true && !experienceLevel ? true : undefined}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="error-experienceLevel"
                  show={touched.experienceLevel === true && !experienceLevel}
                  message="Please select your experience level"
                />
              </div>
              <div>
                <label htmlFor="select-time-owned" className="block text-sm font-semibold text-gray-900 mb-2">
                  Time Owned *
                </label>
                <select
                  id="select-time-owned"
                  value={timeOwned}
                  onChange={(e) => setTimeOwned(e.target.value)}
                  onBlur={() => markTouched("timeOwned")}
                  aria-describedby="error-timeOwned"
                  aria-required="true"
                  aria-invalid={touched.timeOwned === true && !timeOwned ? true : undefined}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {timeOwnedOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="error-timeOwned"
                  show={touched.timeOwned === true && !timeOwned}
                  message="Please select how long you've owned it"
                />
              </div>
            </div>

            <div>
              <p id="verification-group-label" className="block text-sm font-semibold text-gray-900 mb-2">
                Purchase Verification *
              </p>
              <div role="radiogroup" aria-labelledby="verification-group-label" aria-required="true" className="space-y-2">
                {verificationOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      verification === opt.value
                        ? "border-brand-300 bg-brand-50"
                        : "border-gray-200 hover:border-gray-500"
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
              className="px-5 py-3 min-h-[44px] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-lg"
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
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600 ${
                canProceed
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <div className="text-right">
              {submitError && (
                <p role="alert" className="text-sm text-red-600 mb-2">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? "Submitting your review, please wait" : "Submit Review"}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600 ${
                  canProceed && !isSubmitting
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg aria-hidden="true" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Review
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Your review will be verified before publishing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

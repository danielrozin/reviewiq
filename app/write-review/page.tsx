"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { products } from "@/data/products";

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

export default function WriteReviewPage() {
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const isValid =
    selectedProduct &&
    headline &&
    rating > 0 &&
    body.length >= 50 &&
    experienceLevel &&
    timeOwned &&
    verification &&
    reliabilityRating > 0 &&
    easeOfUseRating > 0 &&
    valueRating > 0;

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
          <a
            href="/"
            className="inline-flex px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ name: "Write a Review", url: "/write-review" }]}
      />

      <div className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Write a Review
        </h1>
        <p className="text-gray-500 mb-8">
          Share your honest experience to help others make smarter buying
          decisions. All fields marked with * are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product *
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Review Headline *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Summarize your experience in one sentence"
              maxLength={120}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {headline.length}/120 characters
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating ? "text-amber-400" : "text-gray-200"
                  } hover:text-amber-300`}
                >
                  &#9733;
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500 self-center ml-2">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Sub-Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Reliability *",
                value: reliabilityRating,
                setter: setReliabilityRating,
              },
              {
                label: "Ease of Use *",
                value: easeOfUseRating,
                setter: setEaseOfUseRating,
              },
              {
                label: "Value for Money *",
                value: valueRating,
                setter: setValueRating,
              },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {label}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setter(star)}
                      className={`text-xl transition-colors ${
                        star <= value ? "text-amber-400" : "text-gray-200"
                      } hover:text-amber-300`}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Experience & Ownership */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Experience Level *
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">Select...</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Time Owned *
              </label>
              <select
                value={timeOwned}
                onChange={(e) => setTimeOwned(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">Select...</option>
                {timeOwnedOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Verification */}
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

          {/* Pros */}
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Pros
            </label>
            <div className="space-y-2">
              {pros.map((pro, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500 shrink-0">+</span>
                  <input
                    type="text"
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
              Cons
            </label>
            <div className="space-y-2">
              {cons.map((con, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-red-400 shrink-0">-</span>
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateCon(i, e.target.value)}
                    placeholder={`Con ${i + 1}`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your honest experience. What surprised you? What disappointed you? Would you buy it again? (Minimum 50 characters)"
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              required
              minLength={50}
            />
            <p
              className={`text-xs mt-1 ${
                body.length >= 50 ? "text-emerald-500" : "text-gray-400"
              }`}
            >
              {body.length}/50 minimum characters
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isValid
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Review
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Your review will be verified before publishing. We never edit
              review content.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

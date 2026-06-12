import '@testing-library/jest-dom/vitest'

// Dummy Stripe env so webhook/checkout route handlers don't short-circuit to a
// 500 during tests. The Stripe client and signature verification are mocked
// per-test; these values are never used to reach the real Stripe API.
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_test_dummy'
process.env.STRIPE_SECRET_KEY ||= 'sk_test_dummy'

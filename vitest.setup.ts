import '@testing-library/jest-dom/vitest'

// Provide a dummy Stripe webhook secret so route handlers that guard on it
// (app/api/stripe/webhook/route.ts) reach their mocked logic instead of
// returning 500 "Webhook not configured" under test. constructEvent is mocked,
// so the value is never used for real signature verification.
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_test_dummy'

// Loads @testing-library/jest-dom's matcher augmentation for `tsc --noEmit`.
// vitest.setup.ts also imports this at runtime, but it is excluded from tsconfig,
// so this tsconfig-included declaration file is what makes matchers like
// toBeInTheDocument / toHaveTextContent type-check in *.test.tsx files.
import '@testing-library/jest-dom/vitest'

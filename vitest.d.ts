// Loads the jest-dom matcher augmentations (toBeInTheDocument, toHaveTextContent,
// etc.) into the TypeScript program. The runtime import lives in vitest.setup.ts,
// but that file is excluded from tsconfig, so `npx tsc --noEmit` (the CI Type
// Check job) cannot see the augmentation without this declaration file.
import '@testing-library/jest-dom/vitest'

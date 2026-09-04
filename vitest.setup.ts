import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// The config uses explicit imports (no `globals`), so Testing Library's
// automatic per-test cleanup is not registered. Unmount rendered trees after
// each test to avoid duplicate DOM nodes leaking across cases.
afterEach(() => {
  cleanup();
});

import "@testing-library/jest-dom"; // brings in the matcher definitions
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// scrollTo is not implemented in jsdom
Object.defineProperty(window.HTMLElement.prototype, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
});

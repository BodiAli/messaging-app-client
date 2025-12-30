import { it, describe, expect, vi, beforeEach, afterEach } from "vitest";
import isOnline from "@/utils/isOnline";

const lastSeen = "2020-01-01T01:00:00Z";

describe(isOnline, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return false when current date offset is more than 5 minutes from passed date", () => {
    expect.hasAssertions();

    // 30 mins passed from the initial last seen.
    const date = new Date("2020-01-01T01:30:00Z");
    vi.setSystemTime(date);

    expect(isOnline(lastSeen)).toBe(false);
  });

  it("should return true when current date offset is exactly 5 minutes from passed date", () => {
    expect.hasAssertions();

    // 5 mins passed from the initial last seen.
    const date = new Date("2020-01-01T01:05:00Z");
    vi.setSystemTime(date);

    expect(isOnline(lastSeen)).toBe(true);
  });

  it("should return true when current date offset is less than 5 minutes from passed date", () => {
    expect.hasAssertions();

    // 4 mins passed from the initial last seen.
    const date = new Date("2020-01-01T01:04:00Z");
    vi.setSystemTime(date);

    expect(isOnline(lastSeen)).toBe(true);
  });
});

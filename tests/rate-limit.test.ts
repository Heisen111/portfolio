import { describe, expect, it } from "vitest";
import { createRateLimiter, type RateLimitConfig } from "../api/rate-limit";

describe("rate limiter", () => {
  it("allows the burst budget, then blocks within the minute window", () => {
    const limiter = createRateLimiter({
      burstPerMinute: 5,
      perHour: 30,
      globalPerMinute: 100,
      globalPerHour: 1000,
    } satisfies RateLimitConfig);

    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed("203.0.113.1")).toBe(true);
    }
    expect(limiter.isAllowed("203.0.113.1")).toBe(false);
  });

  it("tracked clients are independent of one another", () => {
    const limiter = createRateLimiter({
      burstPerMinute: 2,
      perHour: 10,
      globalPerMinute: 100,
      globalPerHour: 1000,
    } satisfies RateLimitConfig);

    expect(limiter.isAllowed("client-a")).toBe(true);
    expect(limiter.isAllowed("client-a")).toBe(true);
    expect(limiter.isAllowed("client-a")).toBe(false);
    expect(limiter.isAllowed("client-b")).toBe(true);
  });

  it("enforces the sustained hourly cap", () => {
    const limiter = createRateLimiter({
      burstPerMinute: 100,
      perHour: 3,
      globalPerMinute: 100,
      globalPerHour: 1000,
    } satisfies RateLimitConfig);

    expect(limiter.isAllowed("203.0.113.7")).toBe(true);
    expect(limiter.isAllowed("203.0.113.7")).toBe(true);
    expect(limiter.isAllowed("203.0.113.7")).toBe(true);
    expect(limiter.isAllowed("203.0.113.7")).toBe(false);
  });

  it("applies a global best-effort cap", () => {
    const limiter = createRateLimiter({
      burstPerMinute: 100,
      perHour: 100,
      globalPerMinute: 2,
      globalPerHour: 100,
    } satisfies RateLimitConfig);

    expect(limiter.isAllowed("one")).toBe(true);
    expect(limiter.isAllowed("two")).toBe(true);
    expect(limiter.isAllowed("three")).toBe(false);
  });

  it("reset() clears every window", () => {
    const limiter = createRateLimiter({
      burstPerMinute: 1,
      perHour: 1,
      globalPerMinute: 1,
      globalPerHour: 1,
    } satisfies RateLimitConfig);

    expect(limiter.isAllowed("203.0.113.1")).toBe(true);
    expect(limiter.isAllowed("203.0.113.1")).toBe(false);
    limiter.reset();
    expect(limiter.isAllowed("203.0.113.1")).toBe(true);
  });
});
import { describe, expect, it } from "vitest";

import { createPollInputSchema } from "./schemas";

describe("createPollInputSchema", () => {
  it("accepts a poll with a dates array", () => {
    const result = createPollInputSchema.safeParse({
      title: "Team sync",
      dates: ["2025-01-15", "2025-01-16", "2025-01-17"],
    });

    expect(result.success).toBe(true);
  });

  it("accepts a poll with time slots and a valid timezone", () => {
    const result = createPollInputSchema.safeParse({
      title: "Team sync",
      slots: {
        duration: 30,
        timezone: "Europe/Vienna",
        times: ["2025-01-15T09:00:00Z", "2025-01-15T10:00:00Z"],
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a poll where both dates and slots are provided", () => {
    const result = createPollInputSchema.safeParse({
      title: "Team sync",
      dates: ["2025-01-15"],
      slots: {
        duration: 30,
        timezone: "Europe/Vienna",
        times: ["2025-01-15T09:00:00Z"],
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Cannot provide both 'dates' and 'slots'",
      );
    }
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { dayjs } from "@/lib/dayjs";

import {
  encodeDateOption,
  expectTimeOption,
  formatDuration,
  getDuration,
  removeAllOptionsForDay,
} from "./date-time-utils";

const origDurationFormat = (Intl as { DurationFormat?: unknown }).DurationFormat;
beforeEach(() => {
  delete (Intl as { DurationFormat?: unknown }).DurationFormat;
});
afterEach(() => {
  (Intl as { DurationFormat?: unknown }).DurationFormat = origDurationFormat;
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("formats hours only when minutes is zero", () => {
    expect(formatDuration(60)).toBe("1h");
  });

  it("formats minutes only when under an hour", () => {
    expect(formatDuration(45)).toBe("45m");
  });
});

describe("encodeDateOption", () => {
  it("returns the date string for a date option", () => {
    expect(encodeDateOption({ type: "date", date: "2024-01-15" })).toBe(
      "2024-01-15",
    );
  });

  it("returns start/end joined by slash for a timeSlot option", () => {
    expect(
      encodeDateOption({
        type: "timeSlot",
        start: "2024-01-15T09:00:00",
        end: "2024-01-15T10:00:00",
      }),
    ).toBe("2024-01-15T09:00:00/2024-01-15T10:00:00");
  });
});

describe("removeAllOptionsForDay", () => {
  const options = [
    { type: "date" as const, date: "2024-01-15" },
    { type: "date" as const, date: "2024-01-16" },
    { type: "timeSlot" as const, start: "2024-01-15T09:00:00", end: "2024-01-15T10:00:00" },
  ];

  it("removes both date and timeSlot options that fall on the given day", () => {
    const result = removeAllOptionsForDay(options, new Date(2024, 0, 15));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ type: "date", date: "2024-01-16" });
  });

  it("returns all options unchanged when no option falls on the given day", () => {
    const result = removeAllOptionsForDay(options, new Date(2024, 0, 17));
    expect(result).toHaveLength(3);
  });
});

describe("getDuration", () => {
  it("returns a formatted string for the difference between two timestamps", () => {
    const start = dayjs("2024-01-15T09:00:00");
    const end = dayjs("2024-01-15T10:30:00");
    expect(getDuration(start, end)).toBe("1h 30m");
  });
});

describe("expectTimeOption", () => {
  it("returns the option unchanged when it is a timeSlot", () => {
    const option = {
      type: "timeSlot" as const,
      start: "2024-01-15T09:00:00",
      end: "2024-01-15T10:00:00",
    };
    expect(expectTimeOption(option)).toBe(option);
  });

  it("throws when given a date option", () => {
    expect(() =>
      expectTimeOption({ type: "date", date: "2024-01-15" }),
    ).toThrow("Expected timeSlot but got date instead");
  });
});

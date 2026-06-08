import { describe, expect, test } from "bun:test";
import { formatRelativeActivity } from "./formatRelativeActivity";

describe("formatRelativeActivity", () => {
  const now = new Date("2026-06-08T12:00:00.000Z");

  test("formats missing and sub-day activity", () => {
    expect(formatRelativeActivity(null, now)).toBe("Aldrig");
    expect(
      formatRelativeActivity(new Date("2026-06-08T08:00:00.000Z"), now),
    ).toBe("idag");
    expect(
      formatRelativeActivity(new Date("2026-06-09T08:00:00.000Z"), now),
    ).toBe("idag");
  });

  test("formats days, weeks, months, and years from absolute timestamps", () => {
    expect(
      formatRelativeActivity(new Date("2026-06-07T12:00:00.000Z"), now),
    ).toBe("1 dag sedan");
    expect(
      formatRelativeActivity(new Date("2026-06-05T12:00:00.000Z"), now),
    ).toBe("3 dagar sedan");
    expect(
      formatRelativeActivity(new Date("2026-05-25T12:00:00.000Z"), now),
    ).toBe("2 veckor sedan");
    expect(
      formatRelativeActivity(new Date("2026-01-08T12:00:00.000Z"), now),
    ).toBe("5 månader sedan");
    expect(
      formatRelativeActivity(new Date("2025-06-08T12:00:00.000Z"), now),
    ).toBe("1 år sedan");
    expect(
      formatRelativeActivity(new Date("2024-06-08T12:00:00.000Z"), now),
    ).toBe("2 år sedan");
  });
});

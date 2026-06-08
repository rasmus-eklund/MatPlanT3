const DAY_MS = 24 * 60 * 60 * 1000;

export const formatRelativeActivity = (date: Date | null, now = new Date()) => {
  if (!date) {
    return "Aldrig";
  }

  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  if (elapsedMs < DAY_MS) {
    return "idag";
  }

  const elapsedDays = Math.floor(elapsedMs / DAY_MS);
  if (elapsedDays < 14) {
    return `${elapsedDays} ${elapsedDays === 1 ? "dag" : "dagar"} sedan`;
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedDays < 60) {
    return `${elapsedWeeks} ${elapsedWeeks === 1 ? "vecka" : "veckor"} sedan`;
  }

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedDays < 365) {
    return `${elapsedMonths} ${
      elapsedMonths === 1 ? "månad" : "månader"
    } sedan`;
  }

  const elapsedYears = Math.floor(elapsedDays / 365);
  return `${elapsedYears} ${elapsedYears === 1 ? "år" : "år"} sedan`;
};

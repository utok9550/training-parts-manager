const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return formatLocalDate(new Date());
}

function dateToUtcMilliseconds(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function differenceInDays(laterDate: string, earlierDate: string): number {
  return Math.floor(
    (dateToUtcMilliseconds(laterDate) - dateToUtcMilliseconds(earlierDate)) /
      DAY_IN_MILLISECONDS,
  );
}

export function isWithinRecentSevenDays(date: string, today: string): boolean {
  const elapsedDays = differenceInDays(today, date);
  return elapsedDays >= 0 && elapsedDays <= 6;
}

export function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}/${month}/${day}`;
}

import { format, isToday, parseISO } from "date-fns";

export function formatTriggerTime(isoString: string): string {
  const date = parseISO(isoString);
  const timePart = format(date, "hh : mm a").toLowerCase();
  if (isToday(date)) {
    return timePart;
  }
  return `${format(date, "MMM d")} · ${timePart}`;
}

export function formatTriggerTimeFull(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, "EEEE, MMM d · hh : mm a").toLowerCase();
}

export function formatCalendarDay(isoString: string): string {
  return format(parseISO(isoString), "yyyy-MM-dd");
}

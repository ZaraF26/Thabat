import { format, parseISO, differenceInCalendarDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { BEADS_PER_TASBEEH, SALAH_PER_BEAD } from "./constants";

export const todayStr = () => format(new Date(), "yyyy-MM-dd");

export function prayerStatusMap(logs, date) {
  const map = {};
  (logs || []).forEach((l) => {
    if (l.date === date) map[l.prayer] = l.status;
  });
  return map;
}

export function countPrayedOnDate(logs, date) {
  return (logs || []).filter((l) => l.date === date && l.status === "prayed").length;
}

export function totalPrayed(logs) {
  return (logs || []).filter((l) => l.status === "prayed").length;
}

// Current streak: consecutive "complete" days (5 prayed) ending today (or yesterday if today incomplete).
export function computeStreak(logs) {
  const counts = {};
  (logs || []).forEach((l) => {
    if (l.status === "prayed") counts[l.date] = (counts[l.date] || 0) + 1;
  });
  const completeDates = new Set(
    Object.keys(counts).filter((d) => counts[d] >= 5)
  );

  let current = 0;
  let cursor = new Date();
  if (!completeDates.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }
  while (completeDates.has(format(cursor, "yyyy-MM-dd"))) {
    current++;
    cursor = subDays(cursor, 1);
  }

  // Longest run across history
  const sorted = [...completeDates].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const ds of sorted) {
    if (prev && differenceInCalendarDays(parseISO(ds), parseISO(prev)) === 1) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = ds;
  }
  return { current, longest: Math.max(longest, current) };
}

// Tasbeeh progression
export function tasbeehProgress(logs) {
  const total = totalPrayed(logs);
  const beads = Math.floor(total / SALAH_PER_BEAD);
  const completeTasbeehs = Math.floor(beads / BEADS_PER_TASBEEH);
  const currentBeads = beads % BEADS_PER_TASBEEH;
  return { total, beads, completeTasbeehs, currentBeads };
}

// Quran reading streak (consecutive days with any QuranLog)
export function quranStreak(logs) {
  const dates = new Set((logs || []).map((l) => l.date));
  let current = 0;
  let cursor = new Date();
  if (!dates.has(format(cursor, "yyyy-MM-dd"))) cursor = subDays(cursor, 1);
  while (dates.has(format(cursor, "yyyy-MM-dd"))) {
    current++;
    cursor = subDays(cursor, 1);
  }
  return current;
}

export function monthDays(date = new Date()) {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
}

export function inCurrentMonth(dateStr) {
  return isSameMonth(parseISO(dateStr), new Date());
}

export function sumDhikr(logs) {
  return (logs || []).reduce((acc, l) => acc + (l.count || 0), 0);
}

export function sumQuranPages(logs) {
  return (logs || []).reduce((acc, l) => acc + (l.pages || 0), 0);
}

export function sumQuranVerses(logs) {
  return (logs || []).reduce((acc, l) => acc + (l.verses || 0), 0);
}

export function uniqueSurahs(logs) {
  return new Set((logs || []).map((l) => l.surah_name).filter(Boolean)).size;
}

// Pick a quote for a given date (deterministic by day-of-year)
export function quoteForDay(quotes, date = new Date()) {
  if (!quotes || !quotes.length) return null;
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
}

// All computed stats for rewards/collection
export function computeStats(salahLogs, dhikrLogs, quranLogs) {
  const streak = computeStreak(salahLogs);
  const tasbeeh = tasbeehProgress(salahLogs);
  return {
    totalPrayed: tasbeeh.total,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    completeTasbeehs: tasbeeh.completeTasbeehs,
    totalDhikr: sumDhikr(dhikrLogs),
    quranPages: sumQuranPages(quranLogs),
  };
}
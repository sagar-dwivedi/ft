// Helper function to get start and end of month
export function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start: start.getTime(), end: end.getTime() };
}

// Helper function to get previous month bounds
export function getPreviousMonthBounds(date: Date) {
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
  const end = new Date(
    prevMonth.getFullYear(),
    prevMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start: start.getTime(), end: end.getTime() };
}

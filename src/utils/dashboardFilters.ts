import { startOfMonth, endOfMonth } from 'date-fns';

export const buildDateFilter = (selectedMonths: number[], year: number) => {
  if (!year) return [];
  // If no months are selected, use the whole year
  if (!selectedMonths || selectedMonths.length === 0) {
    const start = startOfMonth(new Date(year, 0));
    const end = endOfMonth(new Date(year, 11));
    return [{ start: start.toISOString(), end: end.toISOString() }];
  }
  // If all 12 months are selected, use the year range
  if (selectedMonths.length === 12) {
    const start = startOfMonth(new Date(year, 0));
    const end = endOfMonth(new Date(year, 11));
    return [{ start: start.toISOString(), end: end.toISOString() }];
  }
  // Otherwise, filter by selected months
  return selectedMonths.map(month => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return { start: start.toISOString(), end: end.toISOString() };
  });
};

export const buildPostgRESTDateFilter = (dateConditions: any[], dateField: string = 'created_at') => {
  if (!dateConditions || dateConditions.length === 0) return '';
  const orConditions = dateConditions.map(condition =>
    `and(${dateField}.gte.${condition.start},${dateField}.lte.${condition.end})`
  ).join(',');
  return `or(${orConditions})`;
};

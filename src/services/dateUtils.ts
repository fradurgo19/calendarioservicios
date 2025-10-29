import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
  isSameDay,
  isToday,
  isSunday,
} from 'date-fns';

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(start, 5);
  return eachDayOfInterval({ start, end });
};

export const getMonthWeeks = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const monthStart = startOfWeek(start, { weekStartsOn: 1 });
  const monthEnd = endOfWeek(end, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  return days.filter(day => !isSunday(day));
};

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd') => {
  return format(date, formatStr);
};

export const formatDateDisplay = (date: Date) => {
  return format(date, 'EEE, MMM d');
};

export const isSameDayUtil = (date1: Date, date2: Date) => {
  return isSameDay(date1, date2);
};

export const isTodayUtil = (date: Date) => {
  return isToday(date);
};

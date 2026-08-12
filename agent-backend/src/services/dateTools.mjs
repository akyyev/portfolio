const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date);

  const value = type => Number(parts.find(part => part.type === type)?.value);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second')
  };
}

function localDateInTimeZone(timeZone, now = new Date()) {
  const parts = getParts(now, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, timeZone) {
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = desiredUtc;

  for (let i = 0; i < 3; i += 1) {
    const actual = getParts(new Date(utc), timeZone);
    const actualUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );
    utc -= actualUtc - desiredUtc;
  }

  return new Date(utc);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date, months) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
}

function startOfWeek(date, weekStartsOn = 'monday') {
  const startDay = WEEKDAYS.indexOf(weekStartsOn);
  const effectiveStartDay = startDay >= 0 ? startDay : 1;
  const daysSinceStart = (date.getUTCDay() - effectiveStartDay + 7) % 7;
  return addDays(date, -daysSinceStart);
}

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function toYmd(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function signedAmount(amount, direction) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value < 0 || value > 366) {
    throw new Error('amount must be a number from 0 to 366.');
  }
  return direction === 'past' ? -value : value;
}

function rangeResult({ timezone, start, endExclusive, calculation }) {
  const endInclusive = addDays(endExclusive, -1);
  return {
    calculation,
    timezone,
    startDate: zonedTimeToUtc(toYmd(start), timezone).toISOString(),
    endDate: zonedTimeToUtc(toYmd(endExclusive), timezone).toISOString(),
    endDateExclusive: true,
    label: `${formatDate(start)} through ${formatDate(endInclusive)}`
  };
}

function shiftedDate(today, { unit = 'day', amount = 0, direction = 'future' }) {
  const delta = signedAmount(amount, direction);
  if (unit === 'day') return addDays(today, delta);
  if (unit === 'week') return addDays(today, delta * 7);
  if (unit === 'month') return addMonths(today, delta);
  throw new Error('unit must be day, week, or month.');
}

function resolveWeekday(today, { weekday, amount = 0, direction = 'future' }) {
  const target = WEEKDAYS.indexOf(String(weekday || '').toLowerCase());
  if (target < 0) {
    throw new Error('weekday must be sunday, monday, tuesday, wednesday, thursday, friday, or saturday.');
  }

  const count = signedAmount(amount, direction);
  if (direction === 'past') {
    const daysBack = ((today.getUTCDay() - target + 7) % 7) + Math.max(0, Math.abs(count) - 1) * 7;
    return addDays(today, -daysBack);
  }

  const daysAhead = ((target - today.getUTCDay() + 7) % 7) + Math.max(0, count) * 7;
  return addDays(today, daysAhead);
}

export function calculateDateRange({
  timezone,
  rangeType,
  unit,
  amount = 0,
  direction = 'future',
  weekStartsOn = 'monday',
  weekday
}) {
  const timeZone = timezone || 'UTC';
  const type = rangeType || 'single_day';
  const today = localDateInTimeZone(timeZone);

  if (!['future', 'past', 'current'].includes(direction)) {
    throw new Error('direction must be future, past, or current.');
  }

  if (type === 'single_day') {
    const start = direction === 'current'
      ? today
      : shiftedDate(today, { unit: unit || 'day', amount, direction });
    return rangeResult({
      timezone: timeZone,
      start,
      endExclusive: addDays(start, 1),
      calculation: { rangeType: type, unit: unit || 'day', amount, direction }
    });
  }

  if (type === 'calendar_week') {
    const anchor = direction === 'current'
      ? today
      : shiftedDate(today, { unit: 'week', amount, direction });
    const start = startOfWeek(anchor, weekStartsOn);
    return rangeResult({
      timezone: timeZone,
      start,
      endExclusive: addDays(start, 7),
      calculation: { rangeType: type, unit: 'week', amount, direction, weekStartsOn }
    });
  }

  if (type === 'calendar_month') {
    const currentMonthStart = startOfMonth(today);
    const anchor = direction === 'current'
      ? currentMonthStart
      : addMonths(currentMonthStart, signedAmount(amount, direction));
    const start = startOfMonth(anchor);
    return rangeResult({
      timezone: timeZone,
      start,
      endExclusive: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)),
      calculation: { rangeType: type, unit: 'month', amount, direction }
    });
  }

  if (type === 'weekday') {
    const start = resolveWeekday(today, { weekday, amount, direction });
    return rangeResult({
      timezone: timeZone,
      start,
      endExclusive: addDays(start, 1),
      calculation: { rangeType: type, weekday, amount, direction }
    });
  }

  throw new Error('rangeType must be single_day, calendar_week, calendar_month, or weekday.');
}

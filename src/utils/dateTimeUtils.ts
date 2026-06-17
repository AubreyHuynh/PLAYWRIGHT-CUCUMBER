type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'D MMMM YYYY' | 'MMMM D, YYYY';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function tomorrow(): Date {
  return addDays(today(), 1);
}

export function yesterday(): Date {
  return addDays(today(), -1);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function format(date: Date, fmt: DateFormat = 'YYYY-MM-DD'): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  switch (fmt) {
    case 'YYYY-MM-DD':
      return `${y}-${pad(m)}-${pad(d)}`;
    case 'MM/DD/YYYY':
      return `${pad(m)}/${pad(d)}/${y}`;
    case 'DD/MM/YYYY':
      return `${pad(d)}/${pad(m)}/${y}`;
    case 'D MMMM YYYY':
      return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
    case 'MMMM D, YYYY':
      return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
  }
}

/** Returns {day, month, year} as strings — matches UserBuilder.dateOfBirth shape */
export function toFormFields(date: Date): { day: string; month: string; year: string } {
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/** Parse common date strings (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY). */
export function fromString(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [a, b, y] = dateStr.split('/').map(Number);
    // MM/DD/YYYY
    return new Date(y, a - 1, b);
  }
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) throw new Error(`Cannot parse date: "${dateStr}"`);
  return parsed;
}

/** Returns true if the year/month combo is still in the future (for card expiry checks). */
export function isCardExpired(expiryYear: number, expiryMonth: number): boolean {
  const now = new Date();
  const expiry = new Date(expiryYear, expiryMonth - 1, 1);
  return expiry < new Date(now.getFullYear(), now.getMonth(), 1);
}

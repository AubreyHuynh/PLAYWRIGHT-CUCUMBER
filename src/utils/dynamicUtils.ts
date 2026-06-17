import { v4 as uuidv4 } from 'uuid';

export function uniqueId(): string {
  return uuidv4();
}

/** Generates a unique test email. Uses timestamp + random suffix to guarantee uniqueness across parallel runs. */
export function uniqueEmail(prefix = 'user'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${Date.now()}-${rand}@test.local`;
}

/** Generates a unique username safe for form fields and URLs. */
export function uniqueUsername(prefix = 'user'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}-${rand}`;
}

/** Inclusive random integer in [min, max]. */
export function randomInt(min: number, max: number): number {
  if (min > max) throw new RangeError(`randomInt: min (${min}) must be <= max (${max})`);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from a non-empty array. */
export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('pickRandom: array must not be empty');
  return items[randomInt(0, items.length - 1)];
}

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Generates a random alphanumeric string of the given length. */
export function randomString(length: number, charset = ALPHANUMERIC): string {
  if (length <= 0) throw new RangeError(`randomString: length must be > 0, got ${length}`);
  return Array.from({ length }, () => charset[randomInt(0, charset.length - 1)]).join('');
}

// ─── General-purpose helpers ───────────────────────────────────────────────

/** Promise-based delay. Prefer WaitHelper / Playwright waiting in test code; use this for non-browser delays only. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation up to `attempts` times, waiting `delayMs` between attempts.
 * Throws the last error if all attempts fail.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const { attempts = 3, delayMs = 500 } = options;
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastError;
}

/** Truncates a string to `max` characters, appending `suffix` if it was cut. */
export function truncate(str: string, max: number, suffix = '…'): string {
  return str.length <= max ? str : str.slice(0, max - suffix.length) + suffix;
}

/** Converts a string to a URL/filename-safe slug (lowercase, hyphens). */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Deep-clones a plain JSON-serialisable object. Do not use on class instances or objects with functions. */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// ─── Type guards ───────────────────────────────────────────────────────────

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

export function isDefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

// ─── Re-exports (barrel) ───────────────────────────────────────────────────

export * from './dateTimeUtils';
export * from './dynamicUtils';
export * from './dynamicValueUtils';

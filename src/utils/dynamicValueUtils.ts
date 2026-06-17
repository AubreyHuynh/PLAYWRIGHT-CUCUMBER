import { format, today, tomorrow, yesterday } from './dateTimeUtils';
import { uniqueEmail, uniqueId, uniqueUsername } from './dynamicUtils';

/**
 * Well-known placeholder keywords resolvable at runtime.
 * Use these in Cucumber step definitions to convert feature-file strings to real values.
 *
 * @example
 *   When('I set the date to {string}', async (value: string) => {
 *     const resolved = resolve(value); // "today" → "2024-06-17"
 *     await page.fill('#dob', resolved);
 *   });
 */
export type DynamicKey =
  | 'today'
  | 'tomorrow'
  | 'yesterday'
  | 'unique'
  | 'unique_email'
  | 'unique_username';

const RESOLVERS: Record<DynamicKey, () => string> = {
  today: () => format(today()),
  tomorrow: () => format(tomorrow()),
  yesterday: () => format(yesterday()),
  unique: () => uniqueId(),
  unique_email: () => uniqueEmail(),
  unique_username: () => uniqueUsername(),
};

export function isKnownKey(value: string): value is DynamicKey {
  return value in RESOLVERS;
}

/**
 * Resolves a dynamic placeholder string to its runtime value.
 * Returns the original string unchanged if it is not a known key.
 */
export function resolve(value: string): string {
  const trimmed = value.trim().toLowerCase() as DynamicKey;
  return isKnownKey(trimmed) ? RESOLVERS[trimmed]() : value;
}

/**
 * Resolves all dynamic placeholders within a template string.
 * Placeholders are wrapped in double curly braces: {{key}}
 *
 * @example
 *   resolveTemplate('Hello {{unique_username}}, your order is due {{tomorrow}}')
 *   // → 'Hello user_1718617200000, your order is due 2024-06-18'
 */
export function resolveTemplate(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const lower = key.toLowerCase() as DynamicKey;
    return isKnownKey(lower) ? RESOLVERS[lower]() : `{{${key}}}`;
  });
}

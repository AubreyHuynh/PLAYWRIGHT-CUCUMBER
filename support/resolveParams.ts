import { resolveTemplate } from '@utils/utils';

/** Resolves {{placeholder}} tokens in a Cucumber step parameter string at runtime. */
export function r(value: string): string {
  return resolveTemplate(value);
}

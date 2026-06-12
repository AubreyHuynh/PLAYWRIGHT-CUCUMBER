import { Locator, Page } from '@playwright/test';

export type LocatorType = 'css' | 'xpath' | 'role' | 'text' | 'testid' | 'id' | 'name' | 'class';

export interface LocatorOptions {
  type: LocatorType;
  value: string;
  // For role locators
  role?: Parameters<Page['getByRole']>[0];
  options?: Parameters<Page['getByRole']>[1];
}

/**
 * Strategy pattern: resolve a locator using the specified approach.
 * Switch the approach via config without changing component code.
 */
export class LocatorStrategy {
  static resolve(page: Page, opts: LocatorOptions): Locator {
    switch (opts.type) {
      case 'css':
        return page.locator(opts.value);
      case 'xpath':
        return page.locator(`xpath=${opts.value}`);
      case 'role':
        return page.getByRole(opts.role!, opts.options);
      case 'text':
        return page.getByText(opts.value);
      case 'testid':
        return page.getByTestId(opts.value);
      case 'id':
        return page.locator(`#${opts.value}`);
      case 'name':
        return page.locator(`[name="${opts.value}"]`);
      case 'class':
        return page.locator(`.${opts.value}`);
      default:
        return page.locator(opts.value);
    }
  }
}

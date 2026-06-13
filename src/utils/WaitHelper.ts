import { Page, Locator } from '@playwright/test';

export class WaitHelper {
  static async forElement(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  static async forElementHidden(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  static async forNetworkIdle(page: Page, timeout = 15_000): Promise<void> {
    await page.waitForLoadState('load', { timeout });
  }

  static async forNavigation(page: Page, timeout = 15_000): Promise<void> {
    await page.waitForLoadState('domcontentloaded', { timeout });
  }

  static async forUrl(page: Page, pattern: string | RegExp, timeout = 15_000): Promise<void> {
    await page.waitForURL(pattern, { timeout });
  }

  static async forResponse(page: Page, urlPattern: string | RegExp, timeout = 15_000) {
    return page.waitForResponse(
      (res) => {
        const url = res.url();
        return typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
      },
      { timeout },
    );
  }

  /** Poll until predicate returns true. Never use page.waitForTimeout. */
  static async until(predicate: () => Promise<boolean>, timeout = 10_000, interval = 500): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await predicate()) return;
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

import { Page, Locator } from '@playwright/test';
import { LocatorStrategy, LocatorOptions } from '../locators/LocatorStrategy';

export abstract class BaseComponent {
  protected page: Page;
  protected root: Locator;

  constructor(page: Page, rootSelector?: string) {
    this.page = page;
    this.root = rootSelector ? page.locator(rootSelector) : page.locator('body');
  }

  protected locate(opts: LocatorOptions): Locator {
    return LocatorStrategy.resolve(this.page, opts);
  }

  protected within(selector: string): Locator {
    return this.root.locator(selector);
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async waitForVisible(timeout = 10_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }
}

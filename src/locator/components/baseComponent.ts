import { Page, Locator } from '@playwright/test';

export type LocatorType = 'css' | 'xpath' | 'role' | 'text' | 'testid' | 'id' | 'name' | 'class';

export interface LocatorOptions {
  type: LocatorType;
  value: string;
  role?: Parameters<Page['getByRole']>[0];
  options?: Parameters<Page['getByRole']>[1];
}

export abstract class BaseComponent {
  protected page: Page;
  protected root: Locator;

  constructor(page: Page, rootSelector?: string) {
    this.page = page;
    this.root = rootSelector ? page.locator(rootSelector) : page.locator('body');
  }

  protected locate(opts: LocatorOptions): Locator {
    switch (opts.type) {
      case 'css':    return this.page.locator(opts.value);
      case 'xpath':  return this.page.locator(`xpath=${opts.value}`);
      case 'role':   return this.page.getByRole(opts.role!, opts.options);
      case 'text':   return this.page.getByText(opts.value);
      case 'testid': return this.page.getByTestId(opts.value);
      case 'id':     return this.page.locator(`#${opts.value}`);
      case 'name':   return this.page.locator(`[name="${opts.value}"]`);
      case 'class':  return this.page.locator(`.${opts.value}`);
      default:       return this.page.locator(opts.value);
    }
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

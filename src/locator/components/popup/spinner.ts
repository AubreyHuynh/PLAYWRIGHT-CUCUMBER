import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Spinner extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="progressbar"], .spinner, .loading') {
    super(page, rootSelector);
  }

  async waitForHidden(timeout = 30_000): Promise<void> {
    await this.root.waitFor({ state: 'hidden', timeout });
  }

  async isLoading(): Promise<boolean> {
    return this.root.isVisible();
  }

  async waitForLoadComplete(timeout = 30_000): Promise<void> {
    if (await this.isLoading()) {
      await this.waitForHidden(timeout);
    }
  }
}

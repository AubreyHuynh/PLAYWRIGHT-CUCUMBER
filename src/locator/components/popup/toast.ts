import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Toast extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="status"], .toast, .notification') {
    super(page, rootSelector);
  }

  async getMessage(): Promise<string> {
    return (await this.root.first().textContent()) || '';
  }

  async waitForToast(timeout = 10_000): Promise<void> {
    await this.root.first().waitFor({ state: 'visible', timeout });
  }

  async waitForToastHidden(timeout = 10_000): Promise<void> {
    await this.root.first().waitFor({ state: 'hidden', timeout });
  }

  async hasText(text: string): Promise<boolean> {
    return this.root.filter({ hasText: text }).isVisible();
  }
}

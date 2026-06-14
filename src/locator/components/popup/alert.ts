import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Alert extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="alert"], .alert') {
    super(page, rootSelector);
  }

  async getMessage(): Promise<string> {
    return (await this.root.first().textContent()) || '';
  }

  async dismiss(selector?: string): Promise<void> {
    const closeBtn = this.root.locator(selector ?? 'button.close, [aria-label="Close"]');
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  async isAlertVisible(): Promise<boolean> {
    return this.root.first().isVisible();
  }

  async waitForAlert(timeout = 5000): Promise<void> {
    await this.root.first().waitFor({ state: 'visible', timeout });
  }
}

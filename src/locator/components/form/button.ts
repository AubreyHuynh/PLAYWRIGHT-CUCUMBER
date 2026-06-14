import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Button extends BaseComponent {
  constructor(page: Page, rootSelector = 'button, [role="button"]') {
    super(page, rootSelector);
  }

  async clickByText(text: string): Promise<void> {
    await this.page.getByRole('button', { name: text }).click();
  }

  async clickBySelector(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async isDisabled(selector: string): Promise<boolean> {
    return this.page.locator(selector).isDisabled();
  }

  async isEnabled(selector: string): Promise<boolean> {
    return this.page.locator(selector).isEnabled();
  }
}

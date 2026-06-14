import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Checkbox extends BaseComponent {
  constructor(page: Page, rootSelector = 'input[type="checkbox"]') {
    super(page, rootSelector);
  }

  async check(selector: string): Promise<void> {
    await this.page.locator(selector).check();
  }

  async uncheck(selector: string): Promise<void> {
    await this.page.locator(selector).uncheck();
  }

  async isChecked(selector: string): Promise<boolean> {
    return this.page.locator(selector).isChecked();
  }

  async checkByLabel(label: string): Promise<void> {
    await this.page.getByLabel(label).check();
  }
}

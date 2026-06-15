import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Radio extends BaseComponent {
  constructor(page: Page, rootSelector = 'input[type="radio"]') {
    super(page, rootSelector);
  }

  async select(selector: string): Promise<void> {
    await this.page.locator(selector).check();
  }

  async selectByLabel(label: string): Promise<void> {
    await this.page.getByLabel(label).check();
  }

  async isSelected(selector: string): Promise<boolean> {
    return this.page.locator(selector).isChecked();
  }

  async getSelectedValue(groupName: string): Promise<string> {
    return (await this.page.locator(`input[type="radio"][name="${groupName}"]:checked`).inputValue()) || '';
  }
}

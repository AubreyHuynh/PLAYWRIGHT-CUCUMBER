import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class DropdownList extends BaseComponent {
  constructor(page: Page, rootSelector = 'select, [role="listbox"], [role="combobox"]') {
    super(page, rootSelector);
  }

  async selectByValue(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption({ value });
  }

  async selectByLabel(selector: string, label: string): Promise<void> {
    await this.page.locator(selector).selectOption({ label });
  }

  async selectByIndex(selector: string, index: number): Promise<void> {
    await this.page.locator(selector).selectOption({ index });
  }

  async getSelectedValue(selector: string): Promise<string> {
    return (await this.page.locator(selector).inputValue()) || '';
  }

  async getAllOptions(selector: string): Promise<string[]> {
    const options = await this.page.locator(`${selector} option`).allTextContents();
    return options.map((o) => o.trim());
  }
}

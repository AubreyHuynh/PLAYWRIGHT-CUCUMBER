import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Input extends BaseComponent {
  constructor(page: Page, rootSelector = 'input[type="text"], input:not([type])') {
    super(page, rootSelector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  async clear(selector: string): Promise<void> {
    await this.page.locator(selector).clear();
  }

  async getValue(selector: string): Promise<string> {
    return (await this.page.locator(selector).inputValue()) || '';
  }

  async fillByLabel(label: string, value: string): Promise<void> {
    await this.page.getByLabel(label).fill(value);
  }

  async fillByPlaceholder(placeholder: string, value: string): Promise<void> {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }
}

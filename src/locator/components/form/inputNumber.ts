import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class InputNumber extends BaseComponent {
  constructor(page: Page, rootSelector = 'input[type="number"]') {
    super(page, rootSelector);
  }

  async fill(selector: string, value: number): Promise<void> {
    await this.page.locator(selector).fill(String(value));
  }

  async getValue(selector: string): Promise<number> {
    const val = await this.page.locator(selector).inputValue();
    return Number(val);
  }

  async increment(selector: string): Promise<void> {
    await this.page.locator(selector).press('ArrowUp');
  }

  async decrement(selector: string): Promise<void> {
    await this.page.locator(selector).press('ArrowDown');
  }

  async clear(selector: string): Promise<void> {
    await this.page.locator(selector).clear();
  }
}

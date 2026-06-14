import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class DatePicker extends BaseComponent {
  constructor(page: Page, rootSelector = '[data-datepicker], .datepicker') {
    super(page, rootSelector);
  }

  async selectDate(selector: string, date: string): Promise<void> {
    await this.page.locator(selector).fill(date);
  }

  async openCalendar(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async getValue(selector: string): Promise<string> {
    return (await this.page.locator(selector).inputValue()) || '';
  }

  async clearDate(selector: string): Promise<void> {
    await this.page.locator(selector).clear();
  }
}

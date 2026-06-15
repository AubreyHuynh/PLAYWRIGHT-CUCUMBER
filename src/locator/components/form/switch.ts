import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Switch extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="switch"], input[type="checkbox"].switch') {
    super(page, rootSelector);
  }

  async toggle(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async turnOn(selector: string): Promise<void> {
    const isOn = await this.isOn(selector);
    if (!isOn) await this.toggle(selector);
  }

  async turnOff(selector: string): Promise<void> {
    const isOn = await this.isOn(selector);
    if (isOn) await this.toggle(selector);
  }

  async isOn(selector: string): Promise<boolean> {
    const el = this.page.locator(selector);
    const ariaChecked = await el.getAttribute('aria-checked');
    if (ariaChecked !== null) return ariaChecked === 'true';
    return el.isChecked();
  }
}

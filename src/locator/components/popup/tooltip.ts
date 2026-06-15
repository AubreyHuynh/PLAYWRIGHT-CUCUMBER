import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Tooltip extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="tooltip"], .tooltip') {
    super(page, rootSelector);
  }

  async hoverTrigger(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).hover();
    await this.root.first().waitFor({ state: 'visible' });
  }

  async getText(): Promise<string> {
    return (await this.root.first().textContent()) || '';
  }

  async isTooltipVisible(): Promise<boolean> {
    return this.root.first().isVisible();
  }
}

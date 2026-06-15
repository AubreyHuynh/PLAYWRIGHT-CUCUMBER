import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Sheet extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="dialog"].sheet, .side-sheet, .drawer') {
    super(page, rootSelector);
  }

  async open(triggerSelector: string): Promise<void> {
    await this.page.locator(triggerSelector).click();
    await this.waitForVisible();
  }

  async close(): Promise<void> {
    const closeBtn = this.within('button[aria-label="Close"], .sheet-close');
    if (await closeBtn.isVisible()) await closeBtn.click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async getTitle(): Promise<string> {
    return (await this.within('.sheet-title, [data-sheet-title]').textContent()) || '';
  }
}

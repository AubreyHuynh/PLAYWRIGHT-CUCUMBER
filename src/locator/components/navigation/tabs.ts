import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Tabs extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="tablist"]') {
    super(page, rootSelector);
  }

  async clickTab(tabName: string): Promise<void> {
    await this.root.getByRole('tab', { name: tabName }).click();
  }

  async getActiveTab(): Promise<string> {
    return (await this.root.locator('[aria-selected="true"], .active').textContent()) || '';
  }

  async getAllTabs(): Promise<string[]> {
    const tabs = await this.root.getByRole('tab').allTextContents();
    return tabs.map((t) => t.trim());
  }

  async isTabSelected(tabName: string): Promise<boolean> {
    const tab = this.root.getByRole('tab', { name: tabName });
    const ariaSelected = await tab.getAttribute('aria-selected');
    return ariaSelected === 'true';
  }
}

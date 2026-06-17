import { Page } from '@playwright/test';
import { ConfigManager } from '../config/ConfigManager';

export class NavigationHelper {
  private page: Page;
  private baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = ConfigManager.getInstance().getBaseUrl();
  }

  async goTo(path: string, retries = 2): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    for (let i = 0; i <= retries; i++) {
      try {
        await this.page.goto(url, { waitUntil: 'load', timeout: 30_000 });
        return;
      } catch (err) {
        if (i === retries) throw err;
      }
    }
  }

  switchBaseUrl(newBase: string): void {
    this.baseUrl = newBase;
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'load' });
  }

  async refresh(): Promise<void> {
    await this.page.reload({ waitUntil: 'load' });
  }

  getCurrentUrl(): string {
    return this.page.url();
  }
}

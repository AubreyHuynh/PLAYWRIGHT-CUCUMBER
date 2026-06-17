import { Page, expect } from '@playwright/test';
import { ConfigManager } from '../config/ConfigManager';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = ConfigManager.getInstance().getBaseUrl();
  }

  abstract getPath(): string;

  async navigate(): Promise<void> {
    await this.safeGoto(this.baseUrl + this.getPath());
  }

  /** Safe navigation with retry. Uses 'load' so JS-rendered content is ready before assertions. */
  async safeGoto(url: string, retries = 2): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'load', timeout: 20_000 });
        return;
      } catch (err) {
        if (attempt === retries) throw err;
      }
    }
  }

  async assertCurrentUrl(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Switch to a new tab opened by an action and return the new Page */
  async switchToNewTab(): Promise<Page> {
    const [newPage] = await Promise.all([this.page.context().waitForEvent('page')]);
    await newPage.waitForLoadState('load');
    return newPage;
  }

  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout: 15_000 });
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async dismissModal(): Promise<void> {
    const closeBtn = this.page.locator('button.close, [data-dismiss="modal"]');
    if (await closeBtn.isVisible()) await closeBtn.click();
  }
}

import { BrowserContext, Cookie } from '@playwright/test';

export class CookieHelper {
  constructor(private context: BrowserContext) {}

  async getAll(): Promise<Cookie[]> {
    return this.context.cookies();
  }

  async get(name: string): Promise<Cookie | undefined> {
    const cookies = await this.context.cookies();
    return cookies.find((c) => c.name === name);
  }

  async set(cookie: Cookie): Promise<void> {
    await this.context.addCookies([cookie]);
  }

  async clearAll(): Promise<void> {
    await this.context.clearCookies();
  }

  async clearLocalAndSession(page: import('@playwright/test').Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async saveState(path: string): Promise<void> {
    await this.context.storageState({ path });
  }
}

import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Pagination extends BaseComponent {
  constructor(page: Page, rootSelector = '.pagination, nav[aria-label="pagination"]') {
    super(page, rootSelector);
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.root.getByRole('link', { name: String(pageNumber) }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goToNext(): Promise<void> {
    await this.root.getByRole('link', { name: /next/i }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goToPrevious(): Promise<void> {
    await this.root.getByRole('link', { name: /prev/i }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCurrentPage(): Promise<string> {
    return (await this.root.locator('.active, [aria-current="page"]').textContent()) || '';
  }

  async getTotalPages(): Promise<number> {
    return this.root.locator('li, a').count();
  }
}

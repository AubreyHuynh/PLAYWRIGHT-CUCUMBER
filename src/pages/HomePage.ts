import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components/Header';

export class HomePage extends BasePage {
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  getPath(): string {
    return '/';
  }

  async isLoaded(): Promise<boolean> {
    return this.page.locator('.features_items').isVisible();
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.page.locator('input#search_product').fill(keyword);
    await this.page.locator('button#submit_search').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCarouselText(): Promise<string> {
    return (await this.page.locator('.active .item h2').first().textContent()) || '';
  }
}

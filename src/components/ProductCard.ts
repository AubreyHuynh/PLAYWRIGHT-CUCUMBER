import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class ProductCard extends BaseComponent {
  private card: Locator;

  constructor(page: Page, productName: string) {
    super(page, '.features_items');
    this.card = page.locator(`.single-products`).filter({
      has: page.locator(`p:text-is("${productName}")`),
    });
  }

  async addToCart(): Promise<void> {
    await this.card.hover();
    await this.card.getByText('Add to cart').first().click();
  }

  async viewProduct(): Promise<void> {
    await this.card.getByText('View Product').click();
  }

  async getPrice(): Promise<string> {
    return (await this.card.locator('h2').textContent()) || '';
  }

  static getCardByIndex(page: Page, index: number): Locator {
    return page.locator('.single-products').nth(index);
  }
}

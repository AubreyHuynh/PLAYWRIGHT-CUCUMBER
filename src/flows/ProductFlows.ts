import { Page } from '@playwright/test';
import { PageFactory } from './PageFactory';

export class ProductFlows {
  private factory: PageFactory;

  constructor(private page: Page) {
    this.factory = new PageFactory(page);
  }

  async searchAndAddToCart(keyword: string, productName: string): Promise<void> {
    const products = this.factory.products();
    await products.navigate();
    await products.searchProduct(keyword);
    await products.addProductToCart(productName);
    await products.clickContinueShopping();
  }

  async addFirstProductToCart(): Promise<void> {
    const products = this.factory.products();
    await products.navigate();
    const names = await products.getAllProductNames();
    if (names.length > 0) {
      await products.addProductToCart(names[0].trim());
      await products.clickContinueShopping();
    }
  }
}

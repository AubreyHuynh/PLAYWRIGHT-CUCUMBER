import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Card } from '../locator/components/display/card';
import { Dialog } from '../locator/components/popup/dialog';

export class ProductsPage extends BasePage {
  readonly modal: Dialog;

  constructor(page: Page) {
    super(page);
    this.modal = new Dialog(page);
  }

  getPath(): string {
    return '/products';
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.page.locator('input#search_product').fill(keyword);
    await this.page.locator('button#submit_search').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getSearchResultCount(): Promise<number> {
    return this.page.locator('.single-products').count();
  }

  async addProductToCart(productName: string): Promise<void> {
    const card = new Card(this.page, productName);
    await card.addToCart();
  }

  async clickContinueShopping(): Promise<void> {
    await this.modal.clickButton('Continue Shopping');
  }

  async clickViewCart(): Promise<void> {
    await this.modal.clickButton('View Cart');
  }

  async assertProductsVisible(): Promise<void> {
    await expect(this.page.locator('.features_items')).toBeVisible();
  }

  async getAllProductNames(): Promise<string[]> {
    return this.page.locator('.productinfo p').allTextContents();
  }

  async viewProductDetail(productName: string): Promise<void> {
    const card = new Card(this.page, productName);
    await card.viewProduct();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async filterByCategory(category: string, subcategory: string): Promise<void> {
    await this.page.getByText(category).click();
    await this.page.getByText(subcategory).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

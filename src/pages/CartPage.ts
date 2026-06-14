import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartTable } from '../locator/components/cart/CartTable';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

export class CartPage extends BasePage {
  private table: CartTable;

  constructor(page: Page) {
    super(page);
    this.table = new CartTable(page);
  }

  getPath(): string {
    return '/view_cart';
  }

  async getCartItems(): Promise<CartItem[]> {
    const rows = await this.table.rows();
    return Promise.all(
      rows.map(async row => ({
        name: await row.name(),
        price: await row.price(),
        quantity: await row.quantity(),
        total: await row.total(),
      })),
    );
  }

  async getCartCount(): Promise<number> {
    return this.table.count();
  }

  async removeItem(productName: string): Promise<void> {
    await this.table.findByName(productName).delete();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Proceed To Checkout' }).click();
    const modal = this.page.locator('.modal');
    if (await modal.isVisible()) {
      await modal.getByRole('link', { name: 'Checkout' }).click();
    }
  }

  async assertProductInCart(productName: string): Promise<void> {
    await this.navigate();
    await expect(
      this.page.locator('#cart_info_table').getByText(productName),
    ).toBeVisible({ timeout: 10_000 });
  }

  async assertCartEmpty(): Promise<void> {
    await expect(this.page.locator('#empty_cart')).toBeVisible({ timeout: 15_000 });
  }
}

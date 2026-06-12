import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

export class CartPage extends BasePage {
  getPath(): string {
    return '/view_cart';
  }

  async getCartItems(): Promise<CartItem[]> {
    const rows = await this.page.locator('#cart_info_table tbody tr').all();
    const items: CartItem[] = [];
    for (const row of rows) {
      items.push({
        name: (await row.locator('td.cart_description h4 a').textContent()) || '',
        price: (await row.locator('td.cart_price p').textContent()) || '',
        quantity: (await row.locator('td.cart_quantity button').textContent()) || '',
        total: (await row.locator('td.cart_total p').textContent()) || '',
      });
    }
    return items;
  }

  async getCartCount(): Promise<number> {
    return this.page.locator('#cart_info_table tbody tr').count();
  }

  async removeItem(productName: string): Promise<void> {
    const row = this.page.locator('#cart_info_table tbody tr').filter({ hasText: productName });
    await row.locator('a.cart_quantity_delete').click();
    await this.page.waitForLoadState('networkidle');
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.locator('a:text("Proceed To Checkout")').click();
  }

  async assertProductInCart(productName: string): Promise<void> {
    await expect(this.page.locator('#cart_info_table').getByText(productName)).toBeVisible();
  }

  async assertCartEmpty(): Promise<void> {
    await expect(this.page.locator('#empty_cart')).toBeVisible();
  }
}

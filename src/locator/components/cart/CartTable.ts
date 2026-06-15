import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';
import { CartRow } from './CartRow';

export class CartTable extends BaseComponent {
  constructor(page: Page) {
    super(page, '#cart_info_table');
  }

  async rows(): Promise<CartRow[]> {
    const locators = await this.root.locator('tbody tr').all();
    return locators.map(loc => new CartRow(loc));
  }

  async count(): Promise<number> {
    return this.root.locator('tbody tr').count();
  }

  findByName(productName: string): CartRow {
    const row = this.root.locator('tbody tr').filter({ hasText: productName });
    return new CartRow(row);
  }
}

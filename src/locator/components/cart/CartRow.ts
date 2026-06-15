import { Locator } from '@playwright/test';

export class CartRow {
  constructor(private row: Locator) {}

  async name(): Promise<string> {
    return (await this.row.locator('td.cart_description h4 a').textContent()) || '';
  }

  async price(): Promise<string> {
    return (await this.row.locator('td.cart_price p').textContent()) || '';
  }

  async quantity(): Promise<string> {
    return (await this.row.locator('td.cart_quantity button').textContent()) || '';
  }

  async total(): Promise<string> {
    return (await this.row.locator('td.cart_total p').textContent()) || '';
  }

  async delete(): Promise<void> {
    await this.row.locator('a.cart_quantity_delete').click();
  }
}

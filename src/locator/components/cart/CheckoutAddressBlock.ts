import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class CheckoutAddressBlock extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async getDeliveryAddress(): Promise<string> {
    return (await this.page.locator('#address_delivery').textContent()) || '';
  }

  async getBillingAddress(): Promise<string> {
    return (await this.page.locator('#address_invoice').textContent()) || '';
  }
}

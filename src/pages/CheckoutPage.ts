import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutAddressBlock } from '../locator/components/cart/CheckoutAddressBlock';

export class CheckoutPage extends BasePage {
  private addressBlock: CheckoutAddressBlock;

  constructor(page: Page) {
    super(page);
    this.addressBlock = new CheckoutAddressBlock(page);
  }

  getPath(): string {
    return '/checkout';
  }

  async getDeliveryAddress(): Promise<string> {
    return this.addressBlock.getDeliveryAddress();
  }

  async getBillingAddress(): Promise<string> {
    return this.addressBlock.getBillingAddress();
  }

  async addComment(comment: string): Promise<void> {
    await this.page.locator('textarea[name="message"]').fill(comment);
  }

  async clickPlaceOrder(): Promise<void> {
    await this.page.getByRole('link', { name: 'Place Order' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

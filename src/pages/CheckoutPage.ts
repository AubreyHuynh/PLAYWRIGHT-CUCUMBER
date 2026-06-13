import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Card } from '../data/builders/CardBuilder';

export class CheckoutPage extends BasePage {
  getPath(): string {
    return '/checkout';
  }

  async getDeliveryAddress(): Promise<string> {
    return (await this.page.locator('#address_delivery').textContent()) || '';
  }

  async addComment(comment: string): Promise<void> {
    await this.page.locator('textarea[name="message"]').fill(comment);
  }

  async placeOrder(): Promise<void> {
    await this.page.locator('a:text("Place Order")').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillPayment(card: Card): Promise<void> {
    await this.page.locator('input[data-qa="name-on-card"]').fill(card.nameOnCard);
    await this.page.locator('input[data-qa="card-number"]').fill(card.cardNumber);
    await this.page.locator('input[data-qa="cvc"]').fill(card.cvc);
    await this.page.locator('input[data-qa="expiry-month"]').fill(card.expiryMonth);
    await this.page.locator('input[data-qa="expiry-year"]').fill(card.expiryYear);
  }

  async confirmPayment(): Promise<void> {
    await this.page.locator('button[data-qa="pay-button"]').click();
    await this.page.waitForURL('**/payment_done/**', { timeout: 20_000 });
  }

  async assertOrderPlaced(): Promise<void> {
    await expect(this.page).toHaveURL(/payment_done/, { timeout: 10_000 });
  }

  async downloadInvoice(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator('a:text("Download Invoice")').click(),
    ]);
    await download.saveAs(`downloads/invoice_${Date.now()}.txt`);
  }
}

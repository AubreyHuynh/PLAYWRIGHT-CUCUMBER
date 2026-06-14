import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';
import { Card } from '../../../data/builders/CardBuilder';

export class PaymentForm extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async fill(card: Card): Promise<void> {
    await this.page.locator('input[data-qa="name-on-card"]').fill(card.nameOnCard);
    await this.page.locator('input[data-qa="card-number"]').fill(card.cardNumber);
    await this.page.locator('input[data-qa="cvc"]').fill(card.cvc);
    await this.page.locator('input[data-qa="expiry-month"]').fill(card.expiryMonth);
    await this.page.locator('input[data-qa="expiry-year"]').fill(card.expiryYear);
  }

  async submit(): Promise<void> {
    await this.page.locator('button[data-qa="pay-button"]').click();
  }
}

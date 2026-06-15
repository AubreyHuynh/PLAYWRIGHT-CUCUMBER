import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Card } from '../data/builders/CardBuilder';
import { PaymentForm } from '../locator/components/cart/PaymentForm';

export class PaymentPage extends BasePage {
  private form: PaymentForm;

  constructor(page: Page) {
    super(page);
    this.form = new PaymentForm(page);
  }

  getPath(): string {
    return '/payment';
  }

  async fillPayment(card: Card): Promise<void> {
    await this.form.fill(card);
  }

  async confirmPayment(): Promise<void> {
    await this.form.submit();
    await this.page.waitForURL('**/payment_done/**', { timeout: 20_000 });
  }
}

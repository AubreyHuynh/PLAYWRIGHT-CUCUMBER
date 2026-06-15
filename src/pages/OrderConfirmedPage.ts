import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderConfirmedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getPath(): string {
    return '/payment_done';
  }

  async assertOrderPlaced(): Promise<void> {
    await expect(this.page).toHaveURL(/payment_done/, { timeout: 10_000 });
    await expect(this.page.getByText('Order Placed!')).toBeVisible({ timeout: 10_000 });
  }

  async downloadInvoice(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('link', { name: 'Download Invoice' }).click(),
    ]);
    await download.saveAs(`downloads/invoice_${Date.now()}.txt`);
  }
}

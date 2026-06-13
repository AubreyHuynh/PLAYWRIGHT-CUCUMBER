import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  getPath(): string {
    return '/contact_us';
  }

  async fillForm(name: string, email: string, subject: string, message: string): Promise<void> {
    await this.page.locator('input[name="name"]').fill(name);
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="subject"]').fill(subject);
    await this.page.locator('textarea[name="message"]').fill(message);
  }

  async uploadFile(filename: string): Promise<void> {
    await this.page.locator('input[name="upload_file"]').setInputFiles(`src/data/files/${filename}`);
  }

  async submit(): Promise<void> {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.page.locator('input[name="submit"]').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertSuccessMessage(): Promise<void> {
    await expect(this.page.locator('#contact-page .alert-success')).toBeVisible({ timeout: 10_000 });
  }
}

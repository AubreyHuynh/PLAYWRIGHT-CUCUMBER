import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  getPath(): string {
    return '/login';
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator('input[data-qa="login-email"]').fill(email);
    await this.page.locator('input[data-qa="login-password"]').fill(password);
    await this.page.locator('button[data-qa="login-button"]').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLoginError(): Promise<string> {
    return (await this.page.locator('p:text("Your email or password is incorrect!")').textContent()) || '';
  }

  async fillSignupName(name: string): Promise<void> {
    await this.page.locator('input[data-qa="signup-name"]').fill(name);
  }

  async fillSignupEmail(email: string): Promise<void> {
    await this.page.locator('input[data-qa="signup-email"]').fill(email);
  }

  async clickSignup(): Promise<void> {
    await this.page.locator('button[data-qa="signup-button"]').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator('.login-form h2')).toBeVisible();
  }
}

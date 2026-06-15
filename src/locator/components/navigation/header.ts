import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Header extends BaseComponent {
  constructor(page: Page) {
    super(page, 'header#header_sticky, header');
  }

  async clickLogo(): Promise<void> {
    await this.page.locator('div.logo a').click();
  }

  async clickNav(linkText: string): Promise<void> {
    await this.page.getByRole('link', { name: linkText }).first().click();
  }

  async clickHome(): Promise<void> {
    await this.clickNav('Home');
  }
  async clickProducts(): Promise<void> {
    await this.clickNav('Products');
  }
  async clickCart(): Promise<void> {
    await this.clickNav('Cart');
  }
  async clickSignupLogin(): Promise<void> {
    await this.clickNav('Signup / Login');
  }
  async clickLogout(): Promise<void> {
    await this.clickNav('Logout');
  }
  async clickContactUs(): Promise<void> {
    await this.clickNav('Contact us');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.getByText('Logged in as').isVisible();
  }

  async getLoggedInUser(): Promise<string> {
    const el = this.page.locator('li a').filter({ hasText: 'Logged in as' });
    const text = await el.textContent();
    return text?.replace('Logged in as', '').trim() || '';
  }
}

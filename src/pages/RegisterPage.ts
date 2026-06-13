import { BasePage } from './BasePage';
import { User } from '../data/builders/UserBuilder';

export class RegisterPage extends BasePage {
  getPath(): string {
    return '/signup';
  }

  async fillRegistrationForm(user: User): Promise<void> {
    // Title
    await this.page.locator(`input[value="${user.title === 'Mr.' ? 'Mr' : 'Mrs'}"]`).check();
    // Name is pre-filled from signup step
    await this.page.locator('input[data-qa="password"]').fill(user.password);
    // Date of birth
    await this.page.locator('select[data-qa="days"]').selectOption(user.dateOfBirth.day);
    await this.page.locator('select[data-qa="months"]').selectOption({ label: this.monthName(user.dateOfBirth.month) });
    await this.page.locator('select[data-qa="years"]').selectOption(user.dateOfBirth.year);
    // Checkboxes
    if (user.newsletter) await this.page.locator('#newsletter').check();
    if (user.optin) await this.page.locator('#optin').check();
    // Address
    await this.page.locator('input[data-qa="first_name"]').fill(user.firstName);
    await this.page.locator('input[data-qa="last_name"]').fill(user.lastName);
    await this.page.locator('input[data-qa="address"]').fill(user.address);
    await this.page.locator('input[data-qa="address2"]').fill(user.address2);
    await this.page.locator('select[data-qa="country"]').selectOption(user.country);
    await this.page.locator('input[data-qa="state"]').fill(user.state);
    await this.page.locator('input[data-qa="city"]').fill(user.city);
    await this.page.locator('input[data-qa="zipcode"]').fill(user.zipcode);
    await this.page.locator('input[data-qa="mobile_number"]').fill(user.mobileNumber);
  }

  async submitRegistration(): Promise<void> {
    await this.page.locator('button[data-qa="create-account"]').click();
    await this.page.waitForURL('**/account_created**', { timeout: 20_000 });
  }

  async isAccountCreated(): Promise<boolean> {
    return this.page.getByText('ACCOUNT CREATED!').isVisible();
  }

  async clickContinue(): Promise<void> {
    await this.page.locator('a[data-qa="continue-button"]').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  private monthName(month: string): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[parseInt(month) - 1] || month;
  }
}

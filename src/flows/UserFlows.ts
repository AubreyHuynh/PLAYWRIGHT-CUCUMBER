import { Page } from '@playwright/test';
import { PageFactory } from './PageFactory';
import { User } from '../data/builders/UserBuilder';
import { AccountsApi } from '../api/endpoints/AccountsApi';
import { DataManager } from '../data/DataManager';

/** Facade: high-level user flows that orchestrate pages. Used by step definitions. */
export class UserFlows {
  private factory: PageFactory;
  private api: AccountsApi;

  constructor(private page: Page) {
    this.factory = new PageFactory(page);
    this.api = new AccountsApi();
  }

  /** Register a new user via UI (full flow) */
  async registerUser(user: User): Promise<void> {
    const login = this.factory.login();
    await login.navigate();
    await login.fillSignupName(user.name);
    await login.fillSignupEmail(user.email);
    await login.clickSignup();

    const register = this.factory.register();
    await register.fillRegistrationForm(user);
    await register.submitRegistration();
    await register.clickContinue();

    DataManager.getInstance().trackAccount(user, 'ui');
  }

  /** Login via UI */
  async loginUser(email: string, password: string): Promise<void> {
    const login = this.factory.login();
    await login.navigate();
    await login.login(email, password);
  }

  /** Logout via header */
  async logoutUser(): Promise<void> {
    await this.factory.home().header.clickLogout();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Create account via API (faster than UI for test setup) */
  async createAccountViaApi(user: User): Promise<void> {
    await this.api.createAccount({
      name: user.name,
      email: user.email,
      password: user.password,
      firstname: user.firstName,
      lastname: user.lastName,
      address1: user.address,
      country: user.country,
      state: user.state,
      city: user.city,
      zipcode: user.zipcode,
      mobile_number: user.mobileNumber,
    });
    DataManager.getInstance().trackAccount(user, 'api');
  }
}

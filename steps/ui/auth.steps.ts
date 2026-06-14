import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { UserBuilder } from '../../src/data/builders/UserBuilder';
import { UserFlows } from '../../src/flows/UserFlows';
import { PageManager } from '../../support/pageManager';

Given('I am on the login page', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.login().navigate();
});

Given('I am logged in as a new user', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  const flows = new UserFlows(this.page);
  await flows.createAccountViaApi(user);
  await flows.loginUser(user.email, user.password);
  this.createdUserEmail = user.email;
  this.createdUserPassword = user.password;
  this.set('registeredUser', { email: user.email, password: user.password });
});

When('I register a new account', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  this.set('registeredUser', user);
  const flows = new UserFlows(this.page);
  await flows.registerUser(user);
});

When(
  'I login with email {string} and password {string}',
  async function (this: CustomWorld, email: string, password: string) {
    const factory = new PageManager(this.page);
    await factory.login().login(email, password);
  },
);

When('I login with the registered credentials', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('registeredUser');
  const factory = new PageManager(this.page);
  await factory.login().login(user.email, user.password);
});

When('I logout', async function (this: CustomWorld) {
  const flows = new UserFlows(this.page);
  await flows.logoutUser();
});

Then('I should be logged in successfully', async function (this: CustomWorld) {
  await expect(this.page.getByText('Logged in as')).toBeVisible({ timeout: 10_000 });
});

Then('I should be logged out', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/login/);
});

Then('I should see {string} in the header', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});

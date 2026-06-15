import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { UserBuilder } from '../../src/data/builders/UserBuilder';
import { APIHelper } from '../../src/api/APIHelper';
import { PageManager } from '../../support/pageManager';

async function attachResponse(world: CustomWorld, data: unknown): Promise<void> {
  await world.attach(JSON.stringify(data, null, 2), 'application/json');
}

const apiHelper = new APIHelper();

Given('a new user account exists via API', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  this.set('apiUser', user);
  await apiHelper.createUser(user);
});

When('I create a new account via API', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  this.set('apiUser', user);
  const response = await apiHelper.createUser(user);
  this.set('accountResponse', response);
  await attachResponse(this, response);
});

When('I verify login via API', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('apiUser');
  const response = await apiHelper.verifyLogin(user.email, user.password);
  this.set('accountResponse', response);
  await attachResponse(this, response);
});

When('I delete the account via API', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('apiUser');
  const response = await apiHelper.deleteUser(user.email, user.password);
  this.set('accountResponse', response);
  await attachResponse(this, response);
});

Then('the account should be created successfully', async function (this: CustomWorld) {
  const response = this.get<{ responseCode: number; message: string }>('accountResponse');
  expect(response.responseCode).toBe(201);
});

Then('the login verification should succeed', async function (this: CustomWorld) {
  const response = this.get<{ responseCode: number }>('accountResponse');
  expect(response.responseCode).toBe(200);
});

Then('I should be able to login via UI with the API-created account', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('apiUser');
  const factory = new PageManager(this.page);
  const login = factory.login();
  await login.navigate();
  await login.login(user.email, user.password);
  await expect(this.page.getByText('Logged in as')).toBeVisible();
});

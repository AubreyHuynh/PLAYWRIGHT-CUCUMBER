import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../src/fixtures/CustomWorld';
import { AccountsApi } from '../../src/api/endpoints/AccountsApi';
import { UserBuilder } from '../../src/data/builders/UserBuilder';
import { DataManager } from '../../src/data/DataManager';
import { PageFactory } from '../../src/flows/PageFactory';

async function attachResponse(world: CustomWorld, data: unknown): Promise<void> {
  await world.attach(JSON.stringify(data, null, 2), 'application/json');
}

const accountsApi = new AccountsApi();

Given('a new user account exists via API', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  this.set('apiUser', user);
  await accountsApi.createAccount({
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
});

When('I create a new account via API', async function (this: CustomWorld) {
  const user = new UserBuilder().build();
  this.set('apiUser', user);
  const response = await accountsApi.createAccount({
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
  this.set('accountResponse', response);
  await attachResponse(this, response);
  DataManager.getInstance().trackAccount(user, 'api');
});

When('I verify login via API', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('apiUser');
  const response = await accountsApi.verifyLogin(user.email, user.password);
  this.set('accountResponse', response);
  await attachResponse(this, response);
});

When('I delete the account via API', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('apiUser');
  const response = await accountsApi.deleteAccount(user.email, user.password);
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
  const factory = new PageFactory(this.page);
  const login = factory.login();
  await login.navigate();
  await login.login(user.email, user.password);
  await expect(this.page.getByText('Logged in as')).toBeVisible();
});

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';
import { r } from '../../support/resolveParams';

Given('I am on the cart page', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.cart().navigate();
});

Then('the cart should contain {string}', async function (this: CustomWorld, rawProductName: string) {
  const productName = r(rawProductName);
  const factory = new PageManager(this.page);
  await factory.cart().assertProductInCart(productName);
});

Then('the cart should have {int} item\\(s\\)', async function (this: CustomWorld, count: number) {
  const factory = new PageManager(this.page);
  const actual = await factory.cart().getCartCount();
  expect(actual).toBe(count);
});

When('I remove {string} from the cart', async function (this: CustomWorld, rawProductName: string) {
  const productName = r(rawProductName);
  const factory = new PageManager(this.page);
  await factory.cart().removeItem(productName);
});

When('I remove the first item from cart', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.cart().navigate();
  const items = await factory.cart().getCartItems();
  if (items.length > 0) {
    await factory.cart().removeItem(items[0].name);
  }
});

When('I proceed to checkout', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.cart().proceedToCheckout();
});

Then('the cart should be empty', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.cart().assertCartEmpty();
});

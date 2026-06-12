import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../src/fixtures/CustomWorld';
import { PageFactory } from '../../src/flows/PageFactory';
import { ProductFlows } from '../../src/flows/ProductFlows';

Given('I am on the products page', async function (this: CustomWorld) {
  const factory = new PageFactory(this.page);
  await factory.products().navigate();
});

When('I search for product {string}', async function (this: CustomWorld, keyword: string) {
  const factory = new PageFactory(this.page);
  await factory.products().searchProduct(keyword);
  this.set('searchKeyword', keyword);
});

When('I add {string} to cart', async function (this: CustomWorld, productName: string) {
  const factory = new PageFactory(this.page);
  await factory.products().addProductToCart(productName);
  await factory.products().clickContinueShopping();
  this.set('addedProduct', productName);
});

When('I add the first available product to cart', async function (this: CustomWorld) {
  const flows = new ProductFlows(this.page);
  await flows.addFirstProductToCart();
});

Then('I should see search results', async function (this: CustomWorld) {
  const factory = new PageFactory(this.page);
  const count = await factory.products().getSearchResultCount();
  expect(count).toBeGreaterThan(0);
});

Then('all results should contain {string}', async function (this: CustomWorld, keyword: string) {
  const factory = new PageFactory(this.page);
  const names = await factory.products().getAllProductNames();
  names.forEach((name) => {
    expect(name.toLowerCase()).toContain(keyword.toLowerCase());
  });
});

Then('the products list should be visible', async function (this: CustomWorld) {
  const factory = new PageFactory(this.page);
  await factory.products().assertProductsVisible();
});

Then('I should see at least {int} products', async function (this: CustomWorld, count: number) {
  const factory = new PageFactory(this.page);
  const actual = await factory.products().getSearchResultCount();
  expect(actual).toBeGreaterThanOrEqual(count);
});

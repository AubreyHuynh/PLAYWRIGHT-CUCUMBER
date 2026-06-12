import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../src/fixtures/CustomWorld';
import { ProductsApi } from '../../src/api/endpoints/ProductsApi';

const productsApi = new ProductsApi();

/** Attach an API response as a JSON blob to the Allure/Cucumber report */
async function attachResponse(world: CustomWorld, label: string, data: unknown): Promise<void> {
  await world.attach(JSON.stringify(data, null, 2), 'application/json');
}

When('I request the products list via API', async function (this: CustomWorld) {
  const response = await productsApi.getAllProducts();
  this.set('productsResponse', response);
  await attachResponse(this, 'GET /productsList', response);
});

When('I search for {string} via API', async function (this: CustomWorld, keyword: string) {
  const response = await productsApi.searchProduct(keyword);
  this.set('searchResponse', response);
  this.set('searchKeyword', keyword);
  await attachResponse(this, `POST /searchProduct keyword=${keyword}`, response);
});

Then('the API response code should be {int}', async function (this: CustomWorld, code: number) {
  const response =
    this.get<{ responseCode: number }>('productsResponse') ||
    this.get<{ responseCode: number }>('searchResponse') ||
    this.get<{ responseCode: number }>('accountResponse');
  expect(response.responseCode).toBe(code);
});

Then('the products list should not be empty', async function (this: CustomWorld) {
  const response = this.get<{ products: unknown[] }>('productsResponse');
  expect(response.products.length).toBeGreaterThan(0);
});

Then('all search results should contain {string} in the name', async function (this: CustomWorld, keyword: string) {
  const response = this.get<{ products: Array<{ name: string }> }>('searchResponse');
  response.products.forEach((p) => {
    expect(p.name.toLowerCase()).toContain(keyword.toLowerCase());
  });
});

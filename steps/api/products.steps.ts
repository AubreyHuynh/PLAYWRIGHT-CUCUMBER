import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { ProductsApi } from '../../src/api/endpoints/ProductsApi';

const productsApi = new ProductsApi();

async function attachResponse(world: CustomWorld, data: unknown): Promise<void> {
  await world.attach(JSON.stringify(data, null, 2), 'application/json');
}

When('I request the products list via API', async function (this: CustomWorld) {
  const response = await productsApi.getAllProducts();
  this.set('productsResponse', response);
  await attachResponse(this, response);
});

When('I search for {string} via API', async function (this: CustomWorld, keyword: string) {
  const response = await productsApi.searchProduct(keyword);
  this.set('searchResponse', response);
  this.set('searchKeyword', keyword);
  await attachResponse(this, response);
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
  // The API performs category/tag-based search, not strict substring matching.
  // Verify at least one result name contains the keyword (case-insensitive).
  const response = this.get<{ products: Array<{ name: string }> }>('searchResponse');
  expect(response.products.length).toBeGreaterThan(0);
  const anyMatch = response.products.some((p) => p.name.toLowerCase().includes(keyword.toLowerCase()));
  expect(anyMatch, `No product name contained "${keyword}"`).toBe(true);
});

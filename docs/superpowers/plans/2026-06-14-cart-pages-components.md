# Cart Pages, Components & Logic Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing page objects (ProductDetailPage, PaymentPage, OrderConfirmedPage), split CheckoutPage, introduce cart-specific UI components (CartRow, CartTable, CheckoutAddressBlock, PaymentForm), and fix all logic bugs in the Playwright-Cucumber framework targeting automationexercise.com.

**Architecture:** Bottom-up — components first, then pages that consume them, then PageManager/flows wiring, then step definitions and features on top. Each layer only references the layer directly beneath it.

**Tech Stack:** Playwright 1.49, Cucumber-JS 11, TypeScript 5.7, ts-node, allure-cucumberjs

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `src/locator/components/cart/CartRow.ts` | Wraps one `#cart_info_table tbody tr`; exposes name/price/quantity/total/delete |
| `src/locator/components/cart/CartTable.ts` | Wraps the full cart table; returns `CartRow[]`, count, findByName |
| `src/locator/components/cart/CheckoutAddressBlock.ts` | Wraps `#address_delivery` + `#address_invoice` |
| `src/locator/components/cart/PaymentForm.ts` | Wraps the five `data-qa` payment inputs and the pay button |
| `src/pages/PaymentPage.ts` | `/payment` page — fillPayment + confirmPayment |
| `src/pages/OrderConfirmedPage.ts` | `/payment_done` page — assertOrderPlaced + downloadInvoice |
| `src/pages/ProductDetailPage.ts` | `/product_details/:id` — navigateToProduct, getProductName, addToCart, etc. |
| `steps/ui/payment.steps.ts` | Cucumber steps for payment and order confirmation |

### Modified files
| File | Change |
|---|---|
| `src/pages/CartPage.ts` | Use CartTable/CartRow; fix `a:text()` selector; add modal guard in proceedToCheckout |
| `src/pages/CheckoutPage.ts` | Remove payment methods; use CheckoutAddressBlock; rename `placeOrder` → `clickPlaceOrder` |
| `src/flows/OrderFlows.ts` | Use PaymentPage + OrderConfirmedPage after checkout split |
| `support/pageManager.ts` | Add payment(), orderConfirmed(), productDetail() factory methods |
| `steps/ui/checkout.steps.ts` | Remove payment steps; split old compound step into discrete steps |
| `features/ui/checkout.feature` | Use new discrete step definitions |
| `features/ui/products.feature` | Add product detail view scenario |

### Deleted files
| File | Reason |
|---|---|
| `src/locator/components/navigation/steps.ts` | Selectors don't exist on automationexercise.com; unused by anything |

---

## Task 1: Delete dead `Steps` component

**Files:**
- Delete: `src/locator/components/navigation/steps.ts`

- [ ] **Step 1: Delete the file**

```bash
rm "src/locator/components/navigation/steps.ts"
```

- [ ] **Step 2: Verify nothing imports it**

```bash
npx grep -r "navigation/steps" src steps support --include="*.ts"
```

Expected: no output (nothing imports it).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove dead Steps navigation component"
```

---

## Task 2: Create `CartRow` component

**Files:**
- Create: `src/locator/components/cart/CartRow.ts`

- [ ] **Step 1: Create the file**

`src/locator/components/cart/CartRow.ts`:
```typescript
import { Locator } from '@playwright/test';

export class CartRow {
  constructor(private row: Locator) {}

  async name(): Promise<string> {
    return (await this.row.locator('td.cart_description h4 a').textContent()) || '';
  }

  async price(): Promise<string> {
    return (await this.row.locator('td.cart_price p').textContent()) || '';
  }

  async quantity(): Promise<string> {
    return (await this.row.locator('td.cart_quantity button').textContent()) || '';
  }

  async total(): Promise<string> {
    return (await this.row.locator('td.cart_total p').textContent()) || '';
  }

  async delete(): Promise<void> {
    await this.row.locator('a.cart_quantity_delete').click();
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/locator/components/cart/CartRow.ts
git commit -m "feat: add CartRow component"
```

---

## Task 3: Create `CartTable` component

**Files:**
- Create: `src/locator/components/cart/CartTable.ts`

- [ ] **Step 1: Create the file**

`src/locator/components/cart/CartTable.ts`:
```typescript
import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';
import { CartRow } from './CartRow';

export class CartTable extends BaseComponent {
  constructor(page: Page) {
    super(page, '#cart_info_table');
  }

  async rows(): Promise<CartRow[]> {
    const locators = await this.root.locator('tbody tr').all();
    return locators.map(loc => new CartRow(loc));
  }

  async count(): Promise<number> {
    return this.root.locator('tbody tr').count();
  }

  findByName(productName: string): CartRow {
    const row = this.root.locator('tbody tr').filter({ hasText: productName });
    return new CartRow(row);
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/locator/components/cart/CartTable.ts
git commit -m "feat: add CartTable component"
```

---

## Task 4: Refactor `CartPage` — use components, fix bugs

**Files:**
- Modify: `src/pages/CartPage.ts`

**Bugs fixed:**
1. `a:text("Proceed To Checkout")` → `getByRole('link', { name: 'Proceed To Checkout' })`
2. Raw `#cart_info_table tbody tr` selectors → delegated to `CartTable`/`CartRow`
3. No modal guard after clicking "Proceed To Checkout" — added

- [ ] **Step 1: Replace the full file content**

`src/pages/CartPage.ts`:
```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartTable } from '../locator/components/cart/CartTable';

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

export class CartPage extends BasePage {
  private table: CartTable;

  constructor(page: Page) {
    super(page);
    this.table = new CartTable(page);
  }

  getPath(): string {
    return '/view_cart';
  }

  async getCartItems(): Promise<CartItem[]> {
    const rows = await this.table.rows();
    return Promise.all(
      rows.map(async row => ({
        name: await row.name(),
        price: await row.price(),
        quantity: await row.quantity(),
        total: await row.total(),
      })),
    );
  }

  async getCartCount(): Promise<number> {
    return this.table.count();
  }

  async removeItem(productName: string): Promise<void> {
    await this.table.findByName(productName).delete();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Proceed To Checkout' }).click();
    const modal = this.page.locator('.modal');
    if (await modal.isVisible()) {
      await modal.getByRole('link', { name: 'Checkout' }).click();
    }
  }

  async assertProductInCart(productName: string): Promise<void> {
    await this.navigate();
    await expect(
      this.page.locator('#cart_info_table').getByText(productName),
    ).toBeVisible({ timeout: 10_000 });
  }

  async assertCartEmpty(): Promise<void> {
    await expect(this.page.locator('#empty_cart')).toBeVisible({ timeout: 15_000 });
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Run cart feature to confirm no regressions**

```bash
npx cucumber-js features/ui/cart.feature --require support/world.ts --require support/hooks.ts --require "steps/**/*.ts" --require-module ts-node/register
```

Expected: all existing cart scenarios pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CartPage.ts
git commit -m "refactor: CartPage uses CartTable/CartRow, fix proceedToCheckout selector and modal guard"
```

---

## Task 5: Create `CheckoutAddressBlock` component

**Files:**
- Create: `src/locator/components/cart/CheckoutAddressBlock.ts`

- [ ] **Step 1: Create the file**

`src/locator/components/cart/CheckoutAddressBlock.ts`:
```typescript
import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class CheckoutAddressBlock extends BaseComponent {
  constructor(page: Page) {
    super(page, '#address_delivery');
  }

  async getDeliveryAddress(): Promise<string> {
    return (await this.page.locator('#address_delivery').textContent()) || '';
  }

  async getBillingAddress(): Promise<string> {
    return (await this.page.locator('#address_invoice').textContent()) || '';
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/locator/components/cart/CheckoutAddressBlock.ts
git commit -m "feat: add CheckoutAddressBlock component"
```

---

## Task 6: Refactor `CheckoutPage` — slim to checkout step only

**Files:**
- Modify: `src/pages/CheckoutPage.ts`

**Changes:**
- Remove `fillPayment()`, `confirmPayment()`, `downloadInvoice()`, `assertOrderPlaced()` — these move to `PaymentPage` and `OrderConfirmedPage`
- Rename `placeOrder()` → `clickPlaceOrder()` to avoid collision with `OrderFlows.placeOrder()`
- Fix `a:text("Place Order")` → `getByRole('link', { name: 'Place Order' })`
- Use `CheckoutAddressBlock` for address access

- [ ] **Step 1: Replace the full file content**

`src/pages/CheckoutPage.ts`:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutAddressBlock } from '../locator/components/cart/CheckoutAddressBlock';

export class CheckoutPage extends BasePage {
  private addressBlock: CheckoutAddressBlock;

  constructor(page: Page) {
    super(page);
    this.addressBlock = new CheckoutAddressBlock(page);
  }

  getPath(): string {
    return '/checkout';
  }

  async getDeliveryAddress(): Promise<string> {
    return this.addressBlock.getDeliveryAddress();
  }

  async getBillingAddress(): Promise<string> {
    return this.addressBlock.getBillingAddress();
  }

  async addComment(comment: string): Promise<void> {
    await this.page.locator('textarea[name="message"]').fill(comment);
  }

  async clickPlaceOrder(): Promise<void> {
    await this.page.getByRole('link', { name: 'Place Order' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: errors on callers of the old `placeOrder()`, `fillPayment()`, `confirmPayment()` — these will be fixed in Tasks 12 and 13.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CheckoutPage.ts
git commit -m "refactor: slim CheckoutPage to checkout step, remove payment methods, rename placeOrder→clickPlaceOrder"
```

---

## Task 7: Create `PaymentForm` component

**Files:**
- Create: `src/locator/components/cart/PaymentForm.ts`

- [ ] **Step 1: Create the file**

`src/locator/components/cart/PaymentForm.ts`:
```typescript
import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';
import { Card } from '../../../data/builders/CardBuilder';

export class PaymentForm extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async fill(card: Card): Promise<void> {
    await this.page.locator('input[data-qa="name-on-card"]').fill(card.nameOnCard);
    await this.page.locator('input[data-qa="card-number"]').fill(card.cardNumber);
    await this.page.locator('input[data-qa="cvc"]').fill(card.cvc);
    await this.page.locator('input[data-qa="expiry-month"]').fill(card.expiryMonth);
    await this.page.locator('input[data-qa="expiry-year"]').fill(card.expiryYear);
  }

  async submit(): Promise<void> {
    await this.page.locator('button[data-qa="pay-button"]').click();
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/locator/components/cart/PaymentForm.ts
git commit -m "feat: add PaymentForm component"
```

---

## Task 8: Create `PaymentPage`

**Files:**
- Create: `src/pages/PaymentPage.ts`

- [ ] **Step 1: Create the file**

`src/pages/PaymentPage.ts`:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Card } from '../data/builders/CardBuilder';
import { PaymentForm } from '../locator/components/cart/PaymentForm';

export class PaymentPage extends BasePage {
  private form: PaymentForm;

  constructor(page: Page) {
    super(page);
    this.form = new PaymentForm(page);
  }

  getPath(): string {
    return '/payment';
  }

  async fillPayment(card: Card): Promise<void> {
    await this.form.fill(card);
  }

  async confirmPayment(): Promise<void> {
    await this.form.submit();
    await this.page.waitForURL('**/payment_done/**', { timeout: 20_000 });
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PaymentPage.ts
git commit -m "feat: add PaymentPage"
```

---

## Task 9: Create `OrderConfirmedPage`

**Files:**
- Create: `src/pages/OrderConfirmedPage.ts`

- [ ] **Step 1: Create the file**

`src/pages/OrderConfirmedPage.ts`:
```typescript
import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderConfirmedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getPath(): string {
    return '/payment_done';
  }

  async assertOrderPlaced(): Promise<void> {
    await expect(this.page).toHaveURL(/payment_done/, { timeout: 10_000 });
    await expect(this.page.getByText('Order Placed!')).toBeVisible({ timeout: 10_000 });
  }

  async downloadInvoice(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('link', { name: 'Download Invoice' }).click(),
    ]);
    await download.saveAs(`downloads/invoice_${Date.now()}.txt`);
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderConfirmedPage.ts
git commit -m "feat: add OrderConfirmedPage"
```

---

## Task 10: Create `ProductDetailPage`

**Files:**
- Create: `src/pages/ProductDetailPage.ts`

- [ ] **Step 1: Create the file**

`src/pages/ProductDetailPage.ts`:
```typescript
import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getPath(): string {
    return '/product_details';
  }

  async navigateToProduct(id: number): Promise<void> {
    await this.safeGoto(`${this.baseUrl}/product_details/${id}`);
  }

  async getProductName(): Promise<string> {
    return (await this.page.locator('div.product-information h2').textContent()) || '';
  }

  async getPrice(): Promise<string> {
    return (await this.page.locator('div.product-information span span').textContent()) || '';
  }

  async getCategory(): Promise<string> {
    const el = this.page.locator('div.product-information p').filter({ hasText: 'Category:' });
    return (await el.textContent()) || '';
  }

  async setQuantity(qty: number): Promise<void> {
    await this.page.locator('input#quantity').fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add to cart' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertProductName(name: string): Promise<void> {
    await expect(this.page.locator('div.product-information h2')).toHaveText(name, { timeout: 10_000 });
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductDetailPage.ts
git commit -m "feat: add ProductDetailPage"
```

---

## Task 11: Update `PageManager`

**Files:**
- Modify: `support/pageManager.ts`

- [ ] **Step 1: Replace the full file content**

`support/pageManager.ts`:
```typescript
import { Page } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { PaymentPage } from '../src/pages/PaymentPage';
import { OrderConfirmedPage } from '../src/pages/OrderConfirmedPage';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import { ContactPage } from '../src/pages/ContactPage';

/** Creates and caches page objects on demand. Never instantiate pages directly in steps. */
export class PageManager {
  private cache = new Map<string, unknown>();

  constructor(private page: Page) {}

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) this.cache.set(key, factory());
    return this.cache.get(key) as T;
  }

  home(): HomePage {
    return this.getOrCreate('home', () => new HomePage(this.page));
  }
  login(): LoginPage {
    return this.getOrCreate('login', () => new LoginPage(this.page));
  }
  register(): RegisterPage {
    return this.getOrCreate('register', () => new RegisterPage(this.page));
  }
  products(): ProductsPage {
    return this.getOrCreate('products', () => new ProductsPage(this.page));
  }
  cart(): CartPage {
    return this.getOrCreate('cart', () => new CartPage(this.page));
  }
  checkout(): CheckoutPage {
    return this.getOrCreate('checkout', () => new CheckoutPage(this.page));
  }
  payment(): PaymentPage {
    return this.getOrCreate('payment', () => new PaymentPage(this.page));
  }
  orderConfirmed(): OrderConfirmedPage {
    return this.getOrCreate('orderConfirmed', () => new OrderConfirmedPage(this.page));
  }
  productDetail(): ProductDetailPage {
    return this.getOrCreate('productDetail', () => new ProductDetailPage(this.page));
  }
  contact(): ContactPage {
    return this.getOrCreate('contact', () => new ContactPage(this.page));
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors (errors from Task 6 about removed methods should now only remain in steps/flows).

- [ ] **Step 3: Commit**

```bash
git add support/pageManager.ts
git commit -m "feat: add payment, orderConfirmed, productDetail to PageManager"
```

---

## Task 12: Update `OrderFlows`

**Files:**
- Modify: `src/flows/OrderFlows.ts`

- [ ] **Step 1: Replace the full file content**

`src/flows/OrderFlows.ts`:
```typescript
import { Page } from '@playwright/test';
import { PageManager as PageFactory } from '../../support/pageManager';
import { Card } from '../data/builders/CardBuilder';

export class OrderFlows {
  private factory: PageFactory;

  constructor(private page: Page) {
    this.factory = new PageFactory(page);
  }

  async placeOrder(card: Card, comment = 'Test order'): Promise<void> {
    const cart = this.factory.cart();
    await cart.navigate();
    await cart.proceedToCheckout();

    const checkout = this.factory.checkout();
    await checkout.addComment(comment);
    await checkout.clickPlaceOrder();

    const payment = this.factory.payment();
    await payment.fillPayment(card);
    await payment.confirmPayment();

    await this.factory.orderConfirmed().assertOrderPlaced();
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/flows/OrderFlows.ts
git commit -m "refactor: OrderFlows uses PaymentPage and OrderConfirmedPage after checkout split"
```

---

## Task 13: Update step definitions

**Files:**
- Modify: `steps/ui/checkout.steps.ts`
- Create: `steps/ui/payment.steps.ts`

- [ ] **Step 1: Replace `checkout.steps.ts`**

`steps/ui/checkout.steps.ts`:
```typescript
import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';

When('I add a comment {string}', async function (this: CustomWorld, comment: string) {
  const factory = new PageManager(this.page);
  await factory.checkout().addComment(comment);
});

When('I place the order', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.checkout().clickPlaceOrder();
});

Then('the delivery address should be visible', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  const address = await factory.checkout().getDeliveryAddress();
  if (!address || address.trim() === '') {
    throw new Error('Delivery address is empty');
  }
});
```

- [ ] **Step 2: Create `payment.steps.ts`**

`steps/ui/payment.steps.ts`:
```typescript
import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';
import { CardBuilder } from '../../src/data/builders/CardBuilder';

When('I fill payment details', async function (this: CustomWorld) {
  const card = new CardBuilder().build();
  const factory = new PageManager(this.page);
  await factory.payment().fillPayment(card);
});

When('I confirm payment', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.payment().confirmPayment();
});

Then('the order should be placed successfully', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.orderConfirmed().assertOrderPlaced();
});

Then('I can download the invoice', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.orderConfirmed().downloadInvoice();
});
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add steps/ui/checkout.steps.ts steps/ui/payment.steps.ts
git commit -m "refactor: split checkout steps, add payment steps"
```

---

## Task 14: Update feature files

**Files:**
- Modify: `features/ui/checkout.feature`
- Modify: `features/ui/products.feature`

- [ ] **Step 1: Replace `checkout.feature`**

`features/ui/checkout.feature`:
```gherkin
@ui @regression
Feature: Checkout and Order Placement

  Scenario: Place a complete order
    Given I am logged in as a new user
    And I am on the products page
    When I add "Blue Top" to cart
    And I am on the cart page
    And I proceed to checkout
    And I add a comment "Automated test order"
    And I place the order
    And I fill payment details
    And I confirm payment
    Then the order should be placed successfully
    And I can download the invoice
```

- [ ] **Step 2: Add product detail scenario to `products.feature`**

Open `features/ui/products.feature` and append this scenario:

```gherkin
  Scenario: View product detail page
    Given I am on the products page
    When I view the detail of product 1
    Then the product name should be visible
    And I can add the product to cart from the detail page
```

- [ ] **Step 3: Add missing step definitions for product detail to `steps/ui/product.steps.ts`**

Append to `steps/ui/product.steps.ts`:
```typescript
When('I view the detail of product {int}', async function (this: CustomWorld, id: number) {
  const factory = new PageManager(this.page);
  await factory.productDetail().navigateToProduct(id);
});

Then('the product name should be visible', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  const name = await factory.productDetail().getProductName();
  if (!name || name.trim() === '') {
    throw new Error('Product name is empty on detail page');
  }
});

Then('I can add the product to cart from the detail page', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.productDetail().addToCart();
});
```

Also add missing import at the top of `steps/ui/product.steps.ts` if not already present — the file already imports `PageManager` but confirm it imports `CustomWorld`:
```typescript
// Confirm these imports exist at the top of product.steps.ts:
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';
import { ProductFlows } from '../../src/flows/ProductFlows';
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Run the full UI suite**

```bash
npm run test:ui
```

Expected: all UI scenarios pass, including the refactored checkout flow and new product detail scenario.

- [ ] **Step 6: Commit**

```bash
git add features/ui/checkout.feature features/ui/products.feature steps/ui/product.steps.ts
git commit -m "feat: update checkout feature, add product detail scenario and steps"
```

---

## Completion Checklist

- [ ] `src/locator/components/navigation/steps.ts` deleted
- [ ] `src/locator/components/cart/CartRow.ts` created
- [ ] `src/locator/components/cart/CartTable.ts` created
- [ ] `src/locator/components/cart/CheckoutAddressBlock.ts` created
- [ ] `src/locator/components/cart/PaymentForm.ts` created
- [ ] `src/pages/PaymentPage.ts` created
- [ ] `src/pages/OrderConfirmedPage.ts` created
- [ ] `src/pages/ProductDetailPage.ts` created
- [ ] `src/pages/CartPage.ts` refactored (components, selector fix, modal guard)
- [ ] `src/pages/CheckoutPage.ts` slimmed (removed payment, renamed method)
- [ ] `src/flows/OrderFlows.ts` updated
- [ ] `support/pageManager.ts` updated
- [ ] `steps/ui/checkout.steps.ts` slimmed
- [ ] `steps/ui/payment.steps.ts` created
- [ ] `features/ui/checkout.feature` updated
- [ ] `features/ui/products.feature` extended
- [ ] `npm run typecheck` passes
- [ ] `npm run test:ui` passes

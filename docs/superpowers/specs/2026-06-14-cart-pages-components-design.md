# Cart Pages, Components & Logic Fix — Design Spec

**Date:** 2026-06-14  
**Approach:** B — Components-first, full clean sweep  
**Target site:** automationexercise.com

---

## 1. New Pages

### 1.1 Split `CheckoutPage` into three focused classes

| Class | File | `getPath()` | Responsibility |
|---|---|---|---|
| `CheckoutPage` | `src/pages/CheckoutPage.ts` | `/checkout` | Review delivery address, add comment, click "Place Order" |
| `PaymentPage` | `src/pages/PaymentPage.ts` | `/payment` | Fill card details, click "Pay and Confirm Order" |
| `OrderConfirmedPage` | `src/pages/OrderConfirmedPage.ts` | `/payment_done` | Assert order success, download invoice |

**Root cause of split:** The existing `CheckoutPage` had `getPath()` returning `/checkout` but `fillPayment()` and `confirmPayment()` operated on the `/payment` page — a different URL entirely.

### 1.2 Add `ProductDetailPage`

| Class | File | `getPath()` | Responsibility |
|---|---|---|---|
| `ProductDetailPage` | `src/pages/ProductDetailPage.ts` | `/product_details` (base) | Read product name/price/category, add to cart from detail view, assert quantity |

`getPath()` returns `/product_details` as a stub (never called directly). Navigation uses `navigateToProduct(id: number)` which calls `safeGoto(baseUrl + '/product_details/' + id)`. The existing `ProductsPage.viewProductDetail()` handles navigation by clicking through — `ProductDetailPage` is used for assertions and interactions once already on the detail page.

**Methods:**
- `navigateToProduct(id: number): Promise<void>`
- `getProductName(): Promise<string>` — `div.product-information h2`
- `getPrice(): Promise<string>` — `div.product-information span span`
- `getCategory(): Promise<string>` — `div.product-information p` containing "Category:"
- `addToCart(): Promise<void>` — clicks `button:has-text("Add to cart")`
- `setQuantity(qty: number): Promise<void>` — fills `input#quantity`
- `assertProductName(name: string): Promise<void>`

### 1.3 `PageManager` additions

Add factory methods:
- `payment()` → `PaymentPage`
- `orderConfirmed()` → `OrderConfirmedPage`
- `productDetail()` → `ProductDetailPage`

---

## 2. New Components

### 2.1 New folder: `src/locator/components/cart/`

#### `CartRow` (`cart/CartRow.ts`)
Wraps a single `#cart_info_table tbody tr`.

Methods:
- `name(): Promise<string>`
- `price(): Promise<string>`
- `quantity(): Promise<string>`
- `total(): Promise<string>`
- `delete(): Promise<void>`

#### `CartTable` (`cart/CartTable.ts`)
Wraps `#cart_info_table`.

Methods:
- `rows(): Promise<CartRow[]>`
- `count(): Promise<number>`
- `findByName(productName: string): CartRow`

`CartPage.getCartItems()`, `getCartCount()`, and `removeItem()` all delegate to `CartTable` — no raw selectors inside page methods.

#### `CheckoutAddressBlock` (`cart/CheckoutAddressBlock.ts`)
Wraps `#address_delivery` and `#address_invoice`.

Methods:
- `getDeliveryAddress(): Promise<string>`
- `getBillingAddress(): Promise<string>`

`CheckoutPage.getDeliveryAddress()` delegates to this component.

#### `PaymentForm` (`cart/PaymentForm.ts`)
Wraps the five payment inputs (`[data-qa="name-on-card"]`, `[data-qa="card-number"]`, `[data-qa="cvc"]`, `[data-qa="expiry-month"]`, `[data-qa="expiry-year"]`).

Methods:
- `fill(card: Card): Promise<void>`
- `submit(): Promise<void>` — clicks `button[data-qa="pay-button"]`

`PaymentPage` uses this as its sole interaction point.

### 2.2 Remove dead component

`src/locator/components/navigation/steps.ts` — uses selectors (`[role="progressbar"]`, `.steps`, `.stepper`) that do not exist on automationexercise.com. Not referenced anywhere in the codebase. **Delete this file.**

---

## 3. Logic Fixes

### 3.1 Selector syntax bugs

Two methods use `a:text("...")` — non-standard Playwright syntax:

| File | Method | Current | Fixed |
|---|---|---|---|
| `CartPage` | `proceedToCheckout()` | `a:text("Proceed To Checkout")` | `getByRole('link', { name: 'Proceed To Checkout' })` |
| `CheckoutPage` | `placeOrder()` | `a:text("Place Order")` | `getByRole('link', { name: 'Place Order' })` |

### 3.2 Missing modal handling in `CartPage.proceedToCheckout()`

On automationexercise.com, clicking "Proceed To Checkout" when not logged in shows a modal with "Register / Login account" and a "Checkout" button. The current method ignores this entirely.

Fix: after clicking, check if `.modal` is visible and click its `a:has-text("Checkout")` anchor if so. Logged-in users see no modal and the check is a no-op.

### 3.3 `OrderFlows.placeOrder()` update

After the `CheckoutPage` split, update `placeOrder()` to:
1. `CartPage` → `proceedToCheckout()`
2. `CheckoutPage` → `addComment(comment)` + `clickPlaceOrder()`
3. `PaymentPage` → `fillPayment(card)` + `confirmPayment()`
4. `OrderConfirmedPage` → `assertOrderPlaced()`

**`PaymentPage` public API** (wraps `PaymentForm` internally):
- `fillPayment(card: Card): Promise<void>`
- `confirmPayment(): Promise<void>` — delegates to `PaymentForm.submit()`, then waits for `/payment_done/` URL

**`CheckoutPage` rename:** The existing `placeOrder()` method (which clicks the "Place Order" link) is renamed to `clickPlaceOrder()` to avoid collision with `OrderFlows.placeOrder()` (the orchestrating method).

---

## 4. Steps & Features

### 4.1 `checkout.feature` — updated scenario

```gherkin
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

### 4.2 Step file changes

| File | Change |
|---|---|
| `steps/ui/checkout.steps.ts` | Slim to CheckoutPage steps only: add comment, place order, assert delivery address |
| `steps/ui/payment.steps.ts` | **New file** — owns `fill payment details`, `confirm payment`, `download invoice` steps |
| `features/ui/products.feature` | Add scenarios for view product detail, add to cart from detail page |

### 4.3 New step definitions in `payment.steps.ts`

```
When I fill payment details
When I confirm payment
Then the order should be placed successfully
Then I can download the invoice
```

---

## 5. File Inventory

### New files
- `src/pages/PaymentPage.ts`
- `src/pages/OrderConfirmedPage.ts`
- `src/pages/ProductDetailPage.ts`
- `src/locator/components/cart/CartRow.ts`
- `src/locator/components/cart/CartTable.ts`
- `src/locator/components/cart/CheckoutAddressBlock.ts`
- `src/locator/components/cart/PaymentForm.ts`
- `steps/ui/payment.steps.ts`

### Modified files
- `src/pages/CheckoutPage.ts` — remove payment methods, use CheckoutAddressBlock
- `src/pages/CartPage.ts` — use CartTable/CartRow, fix selector, add modal handling
- `src/flows/OrderFlows.ts` — use PaymentPage + OrderConfirmedPage
- `support/pageManager.ts` — add payment(), orderConfirmed(), productDetail()
- `steps/ui/checkout.steps.ts` — remove payment steps
- `features/ui/checkout.feature` — updated steps
- `features/ui/products.feature` — add product detail scenarios

### Deleted files
- `src/locator/components/navigation/steps.ts`

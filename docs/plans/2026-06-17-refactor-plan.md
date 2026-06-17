# Playwright + Cucumber Framework Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate email generation, standardize wait strategy, improve teardown visibility, wire `{{placeholder}}` resolution transparently into all step definitions, and add two executable showcase scenarios.

**Architecture:** Foundation-first three-layer approach — Layer 0 removes duplication and inconsistency in utility code; Layer 1 introduces a thin `r()` wrapper in every step file so `{{unique_email}}`, `{{today}}`, etc. work in any Gherkin string parameter; Layer 2 adds two `@dynamic` scenarios and a new Cucumber profile to run them.

**Tech Stack:** TypeScript 5.7 (strict), Playwright 1.49, Cucumber 11, Faker.js 9, uuid 11

## Global Constraints

- TypeScript strict mode — no implicit `any`, no `@ts-ignore`
- Use path aliases (`@utils`, `@pages`, `@support`) from `tsconfig.json` for all new imports
- Do NOT touch page object internals, component objects (`src/locator/`), API layer (`src/api/`), DB layer (`src/db/`), or flow orchestrators (`src/flows/`)
- Every task ends with `npm run typecheck` passing before committing
- Conventional commit format: `feat:`, `fix:`, `refactor:`, `docs:`

---

### Task 1: Deduplicate email generation

**Files:**
- Modify: `src/utils/RandomDataGenerator.ts`
- Modify: `src/data/builders/UserBuilder.ts`

**Interfaces:**
- Consumes: `uniqueEmail(prefix: string): string` from `src/utils/dynamicUtils.ts` (already exists)
- Produces: no interface change — `RandomDataGenerator.user()` and `UserBuilder.build()` outputs are identical; only the inline duplication is removed

- [ ] **Step 1: Update `src/utils/RandomDataGenerator.ts`**

Add the import and replace the inline email expression. Full file:

```typescript
import { faker } from '@faker-js/faker';
import { uniqueEmail } from './dynamicUtils';

export interface RandomUser {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export class RandomDataGenerator {
  /** Generate a random user using faker. Email delegates to uniqueEmail() for parallel-safe uniqueness. */
  static user(): RandomUser {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      name: `${firstName} ${lastName}`,
      email: uniqueEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`),
      password: faker.internet.password({ length: 12, memorable: true }),
      firstName,
      lastName,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipcode: faker.location.zipCode(),
      country: 'United States',
    };
  }

  /** Fetch a random user from randomuser.me API */
  static async fetchOnlineUser(): Promise<RandomUser> {
    const res = await fetch('https://randomuser.me/api/?nat=us');
    const data = (await res.json()) as {
      results: Array<{
        name: { first: string; last: string };
        email: string;
        phone: string;
        location: {
          street: { number: number; name: string };
          city: string;
          state: string;
          postcode: string;
          country: string;
        };
        login: { password: string };
      }>;
    };
    const u = data.results[0];
    return {
      name: `${u.name.first} ${u.name.last}`,
      email: u.email.replace('@', `+${Date.now()}@`),
      password: u.login.password,
      firstName: u.name.first,
      lastName: u.name.last,
      phone: u.phone,
      address: `${u.location.street.number} ${u.location.street.name}`,
      city: u.location.city,
      state: u.location.state,
      zipcode: String(u.location.postcode),
      country: u.location.country,
    };
  }
}
```

- [ ] **Step 2: Update `src/data/builders/UserBuilder.ts`**

Add the import and replace the inline email expression. Full file:

```typescript
import { faker } from '@faker-js/faker';
import { uniqueEmail } from '@utils/dynamicUtils';

export interface User {
  name: string;
  email: string;
  password: string;
  title: 'Mr.' | 'Mrs.';
  firstName: string;
  lastName: string;
  dateOfBirth: { day: string; month: string; year: string };
  newsletter: boolean;
  optin: boolean;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class UserBuilder {
  private user: User;

  constructor() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    this.user = {
      name: `${firstName} ${lastName}`,
      email: uniqueEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`),
      password: 'Test@1234',
      title: 'Mr.',
      firstName,
      lastName,
      dateOfBirth: { day: '15', month: '6', year: '1990' },
      newsletter: true,
      optin: true,
      address: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: 'United States',
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.phone.number(),
    };
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withTitle(title: 'Mr.' | 'Mrs.'): this {
    this.user.title = title;
    return this;
  }

  build(): User {
    return { ...this.user };
  }
}
```

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 4: Commit**

```bash
git add src/utils/RandomDataGenerator.ts src/data/builders/UserBuilder.ts
git commit -m "refactor: consolidate email generation to uniqueEmail() in RandomDataGenerator and UserBuilder"
```

---

### Task 2: Standardize wait strategy

**Files:**
- Modify: `src/pages/BasePage.ts` — `safeGoto()` switches from `domcontentloaded` to `load`
- Modify: `src/utils/WaitHelper.ts` — `forNetworkIdle()` gets `@deprecated` JSDoc

**Interfaces:**
- Consumes: nothing new
- Produces: `BasePage.safeGoto()` now waits for the `load` event — JS-rendered content is available after navigation; all pages inheriting `BasePage` get this automatically

- [ ] **Step 1: Update `safeGoto` in `src/pages/BasePage.ts`**

Find this block:
```typescript
  /** Safe navigation with retry. Uses 'domcontentloaded' so image-heavy pages don't stall. */
  async safeGoto(url: string, retries = 2): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
```

Replace with:
```typescript
  /** Safe navigation with retry. Uses 'load' so JS-rendered content is ready before assertions. */
  async safeGoto(url: string, retries = 2): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'load', timeout: 20_000 });
```

- [ ] **Step 2: Add `@deprecated` to `forNetworkIdle` in `src/utils/WaitHelper.ts`**

Find:
```typescript
  /**
   * Waits until there are no in-flight network requests for 500 ms.
   * NOTE: `networkidle` is inherently flaky on pages with polling/analytics — prefer `forLoad` in most cases.
   */
  static async forNetworkIdle(page: Page, timeout = 15_000): Promise<void> {
```

Replace with:
```typescript
  /**
   * @deprecated Prefer {@link forLoad} — `networkidle` is inherently flaky on pages with polling/analytics.
   * Waits until there are no in-flight network requests for 500 ms.
   */
  static async forNetworkIdle(page: Page, timeout = 15_000): Promise<void> {
```

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/BasePage.ts src/utils/WaitHelper.ts
git commit -m "fix: standardize navigation wait to 'load' in BasePage; deprecate forNetworkIdle"
```

---

### Task 3: DataManager teardown logging

**Files:**
- Modify: `src/data/DataManager.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `teardownAll()` emits `console.warn` on failure — control flow is unchanged; teardown remains best-effort

- [ ] **Step 1: Update the catch block in `src/data/DataManager.ts`**

Find:
```typescript
      } catch {
        // Best-effort cleanup
      }
```

Replace with:
```typescript
      } catch (err) {
        console.warn(`[DataManager] teardown failed for account "${account.email}":`, err);
      }
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 3: Commit**

```bash
git add src/data/DataManager.ts
git commit -m "fix: log DataManager teardown failures instead of silently swallowing them"
```

---

### Task 4: Create resolveParams helper

**Files:**
- Create: `support/resolveParams.ts`

**Interfaces:**
- Consumes: `resolveTemplate(template: string): string` from `src/utils/dynamicValueUtils.ts`
- Produces: `r(value: string): string` — imported by all step files in Tasks 5, 6, 7, and 8

- [ ] **Step 1: Create `support/resolveParams.ts`**

```typescript
import { resolveTemplate } from '@utils/utils';

/** Resolves {{placeholder}} tokens in a Cucumber step parameter string at runtime. */
export function r(value: string): string {
  return resolveTemplate(value);
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 3: Commit**

```bash
git add support/resolveParams.ts
git commit -m "feat: add r() helper for transparent {{placeholder}} resolution in step parameters"
```

---

### Task 5: Wire r() into UI step definitions

**Files:**
- Modify: `steps/ui/auth.steps.ts` — 2 steps with `{string}` params
- Modify: `steps/ui/cart.steps.ts` — 2 steps with `{string}` params
- Modify: `steps/ui/contact.steps.ts` — 1 step with `{string}` param
- Modify: `steps/ui/product.steps.ts` — 3 steps with `{string}` params
- `steps/ui/checkout.steps.ts` — no changes (zero `{string}` parameters)

**Interfaces:**
- Consumes: `r(value: string): string` from `support/resolveParams.ts` (Task 4)
- Produces: all string step params resolve `{{placeholders}}` before reaching page methods

- [ ] **Step 1: Update `steps/ui/auth.steps.ts`**

Add this import after the existing imports:
```typescript
import { r } from '../../support/resolveParams';
```

Replace the `I login with email` step:
```typescript
When(
  'I login with email {string} and password {string}',
  async function (this: CustomWorld, rawEmail: string, rawPassword: string) {
    const email = r(rawEmail);
    const password = r(rawPassword);
    const factory = new PageManager(this.page);
    await factory.login().login(email, password);
  },
);
```

Replace the `I should see {string} in the header` step:
```typescript
Then('I should see {string} in the header', async function (this: CustomWorld, rawText: string) {
  const text = r(rawText);
  await expect(this.page.getByText(text)).toBeVisible();
});
```

- [ ] **Step 2: Update `steps/ui/cart.steps.ts`**

Add import after existing imports:
```typescript
import { r } from '../../support/resolveParams';
```

Replace the `the cart should contain` step:
```typescript
Then('the cart should contain {string}', async function (this: CustomWorld, rawProductName: string) {
  const productName = r(rawProductName);
  const factory = new PageManager(this.page);
  await factory.cart().assertProductInCart(productName);
});
```

Replace the `I remove {string} from the cart` step:
```typescript
When('I remove {string} from the cart', async function (this: CustomWorld, rawProductName: string) {
  const productName = r(rawProductName);
  const factory = new PageManager(this.page);
  await factory.cart().removeItem(productName);
});
```

- [ ] **Step 3: Update `steps/ui/contact.steps.ts`**

Add import after existing imports:
```typescript
import { r } from '../../support/resolveParams';
```

Replace the `I upload {string} as attachment` step:
```typescript
When('I upload {string} as attachment', async function (this: CustomWorld, rawFilename: string) {
  const filename = r(rawFilename);
  const factory = new PageManager(this.page);
  await factory.contact().uploadFile(filename);
});
```

- [ ] **Step 4: Update `steps/ui/product.steps.ts`**

Add import after existing imports:
```typescript
import { r } from '../../support/resolveParams';
```

Replace the `I search for product {string}` step:
```typescript
When('I search for product {string}', async function (this: CustomWorld, rawKeyword: string) {
  const keyword = r(rawKeyword);
  const factory = new PageManager(this.page);
  await factory.products().searchProduct(keyword);
  this.set('searchKeyword', keyword);
});
```

Replace the `I add {string} to cart` step:
```typescript
When('I add {string} to cart', async function (this: CustomWorld, rawProductName: string) {
  const productName = r(rawProductName);
  const factory = new PageManager(this.page);
  await factory.products().addProductToCart(productName);
  await factory.products().clickContinueShopping();
  this.set('addedProduct', productName);
});
```

Replace the `all results should contain {string}` step:
```typescript
Then('all results should contain {string}', async function (this: CustomWorld, rawKeyword: string) {
  const keyword = r(rawKeyword);
  const factory = new PageManager(this.page);
  const names = await factory.products().getAllProductNames();
  names.forEach((name) => {
    expect(name.toLowerCase()).toContain(keyword.toLowerCase());
  });
});
```

- [ ] **Step 5: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 6: Commit**

```bash
git add steps/ui/auth.steps.ts steps/ui/cart.steps.ts steps/ui/contact.steps.ts steps/ui/product.steps.ts
git commit -m "feat: wire r() placeholder resolution into UI step string parameters"
```

---

### Task 6: Wire r() into API step definitions

**Files:**
- Modify: `steps/api/products.steps.ts` — 2 steps with `{string}` params
- `steps/api/accounts.steps.ts` — no changes (zero `{string}` parameters)

**Interfaces:**
- Consumes: `r(value: string): string` from `support/resolveParams.ts` (Task 4)
- Produces: API product search steps resolve `{{placeholders}}` before the API call

- [ ] **Step 1: Update `steps/api/products.steps.ts`**

Add import after existing imports:
```typescript
import { r } from '../../support/resolveParams';
```

Replace the `I search for {string} via API` step:
```typescript
When('I search for {string} via API', async function (this: CustomWorld, rawKeyword: string) {
  const keyword = r(rawKeyword);
  const response = await productsApi.searchProduct(keyword);
  this.set('searchResponse', response);
  this.set('searchKeyword', keyword);
  await attachResponse(this, response);
});
```

Replace the `all search results should contain {string} in the name` step:
```typescript
Then('all search results should contain {string} in the name', async function (this: CustomWorld, rawKeyword: string) {
  const keyword = r(rawKeyword);
  const response = this.get<{ products: Array<{ name: string }> }>('searchResponse');
  expect(response.products.length).toBeGreaterThan(0);
  const anyMatch = response.products.some((p) => p.name.toLowerCase().includes(keyword.toLowerCase()));
  expect(anyMatch, `No product name contained "${keyword}"`).toBe(true);
});
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 3: Commit**

```bash
git add steps/api/products.steps.ts
git commit -m "feat: wire r() placeholder resolution into API step string parameters"
```

---

### Task 7: Auth showcase scenario

**Files:**
- Modify: `features/ui/auth.feature` — append `@dynamic` scenario
- Modify: `steps/ui/auth.steps.ts` — append new step definition (`r()` import already present from Task 5)

**Interfaces:**
- Consumes: `r()` (already imported), `UserBuilder` (already imported), `UserFlows` (already imported)
- Produces: `@dynamic` tag has one passing scenario; `npm run test:dynamic` exercises it end-to-end

- [ ] **Step 1: Append scenario to `features/ui/auth.feature`**

Add at the end of the file (inside the Feature block, after the last Scenario):

```gherkin
  @smoke @dynamic
  Scenario: Register with dynamically generated credentials
    When I register a new account with email "{{unique_email}}" and username "{{unique_username}}"
    Then I should be logged in successfully
```

> Note: `auth.feature` has Background `Given I am on the login page` which applies to this scenario — that is correct, registration starts from the login page area.

- [ ] **Step 2: Run to confirm the step is undefined**

Run: `npx cucumber-js --profile ui --tags @dynamic --dry-run 2>&1`
Expected: output includes `Undefined` for `I register a new account with email {string} and username {string}`

- [ ] **Step 3: Append new step definition to `steps/ui/auth.steps.ts`**

```typescript
When(
  'I register a new account with email {string} and username {string}',
  async function (this: CustomWorld, rawEmail: string, rawUsername: string) {
    const email = r(rawEmail);
    const username = r(rawUsername);
    const user = new UserBuilder().withEmail(email).withName(username).build();
    this.set('registeredUser', user);
    const flows = new UserFlows(this.page);
    await flows.registerUser(user);
  },
);
```

- [ ] **Step 4: Verify dry-run finds the step**

Run: `npx cucumber-js --profile ui --tags @dynamic --dry-run 2>&1`
Expected: no `Undefined` steps; all steps show as matched

- [ ] **Step 5: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 6: Commit**

```bash
git add features/ui/auth.feature steps/ui/auth.steps.ts
git commit -m "feat: add @dynamic showcase scenario for dynamic credential registration"
```

---

### Task 8: Contact showcase scenario

**Files:**
- Modify: `features/ui/contact.feature` — append `@dynamic` scenario
- Modify: `steps/ui/contact.steps.ts` — append new step definition (`r()` import already present from Task 5)

**Interfaces:**
- Consumes: `r()` (already imported), `PageManager` (already imported), `contact().fillForm(name, email, subject, message): Promise<void>`
- Produces: `@dynamic` tag has two passing scenarios

- [ ] **Step 1: Read `features/ui/contact.feature`**

Read the file to confirm its Background (if any) before editing. If a Background navigates to the contact page (e.g. `Given I am on the contact page`), omit that step from the scenario below.

- [ ] **Step 2: Append scenario to `features/ui/contact.feature`**

Add at the end of the file:

```gherkin
  @smoke @dynamic
  Scenario: Submit contact form with dynamic sender identity
    Given I am on the contact page
    When I fill the contact form with name "{{unique_username}}" and email "{{unique_email}}"
    And I submit the contact form
    Then I should see a contact success message
```

> If the file already has a Background `Given I am on the contact page`, remove that line from this scenario (the Background handles it).

- [ ] **Step 3: Run to confirm step is undefined**

Run: `npx cucumber-js --profile ui --tags @dynamic --dry-run 2>&1`
Expected: output includes `Undefined` for `I fill the contact form with name {string} and email {string}`

- [ ] **Step 4: Append new step definition to `steps/ui/contact.steps.ts`**

```typescript
When(
  'I fill the contact form with name {string} and email {string}',
  async function (this: CustomWorld, rawName: string, rawEmail: string) {
    const name = r(rawName);
    const email = r(rawEmail);
    const factory = new PageManager(this.page);
    await factory.contact().fillForm(name, email, 'Automated contact test', 'This is an automated test message.');
  },
);
```

- [ ] **Step 5: Verify dry-run has no undefined steps**

Run: `npx cucumber-js --profile ui --tags @dynamic --dry-run 2>&1`
Expected: all `@dynamic` steps matched; no `Undefined`

- [ ] **Step 6: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

- [ ] **Step 7: Commit**

```bash
git add features/ui/contact.feature steps/ui/contact.steps.ts
git commit -m "feat: add @dynamic showcase scenario for contact form with dynamic sender identity"
```

---

### Task 9: Dynamic profile, tag docs, new utility registration

**Files:**
- Modify: `cucumber.js` — add `dynamic` profile
- Modify: `package.json` — add `test:dynamic` script
- Modify: `README.md` — add `@dynamic`/`@deprecated` tag docs and new utility table
- Stage: `src/utils/dateTimeUtils.ts`, `src/utils/dynamicUtils.ts`, `src/utils/dynamicValueUtils.ts`, `src/utils/utils.ts` (currently untracked)

**Interfaces:**
- Consumes: nothing new
- Produces: `npm run test:dynamic` executes all `@dynamic` scenarios; new util files tracked in git

- [ ] **Step 1: Add `dynamic` profile to `cucumber.js`**

In `module.exports`, add after the `parallel` entry:

```javascript
  dynamic: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@dynamic and not @skip',
  },
```

- [ ] **Step 2: Add `test:dynamic` to `package.json`**

In the `"scripts"` block, add after `"test:parallel"`:

```json
"test:dynamic": "cucumber-js --profile dynamic",
```

- [ ] **Step 3: Add tag docs to `README.md`**

Find the section documenting test tags (look for `@smoke`, `@regression`, `@flaky`). Add two rows to the tags table:

```markdown
| `@dynamic`    | Uses `{{placeholder}}` data; verifies parallel-safe dynamic value resolution |
| `@deprecated` | Scenario is scheduled for removal — use alongside `@skip`                    |
```

- [ ] **Step 4: Add utility docs to `README.md`**

Find the utilities documentation section (look for `WaitHelper`, `RandomDataGenerator`, or a "Utilities" heading). Add a new subsection:

```markdown
### Dynamic Value Utilities

| File | Purpose | Key exports |
|---|---|---|
| `src/utils/dateTimeUtils.ts` | Date manipulation & formatting | `today()`, `tomorrow()`, `format()`, `toFormFields()` |
| `src/utils/dynamicUtils.ts` | Parallel-safe unique value generation | `uniqueEmail()`, `uniqueUsername()`, `uniqueId()`, `randomInt()` |
| `src/utils/dynamicValueUtils.ts` | `{{placeholder}}` resolution engine | `resolveTemplate()`, `resolve()`, `isKnownKey()` |
| `src/utils/utils.ts` | General helpers + barrel re-export | `sleep()`, `retry()`, `truncate()`, `deepClone()` |

**Usage in feature files:** Any Cucumber step that passes through `r()` resolves `{{key}}` tokens at runtime:

```gherkin
When I register a new account with email "{{unique_email}}" and username "{{unique_username}}"
When I fill the contact form with name "{{unique_username}}" and email "{{unique_email}}"
```
```

- [ ] **Step 5: Verify the new Cucumber profile resolves**

Run: `npx cucumber-js --profile dynamic --dry-run 2>&1 | tail -10`
Expected: lists `@dynamic` scenarios, exits 0, no "unknown profile" error

- [ ] **Step 6: Commit everything**

```bash
git add src/utils/dateTimeUtils.ts src/utils/dynamicUtils.ts src/utils/dynamicValueUtils.ts src/utils/utils.ts
git add cucumber.js package.json README.md
git commit -m "feat: add dynamic cucumber profile, register utility files, document tags and dynamic value system"
```

---

## Final Verification

Run these in order after all tasks complete:

```bash
# 1. TypeScript compiles cleanly
npm run typecheck

# 2. Dry-run dynamic profile — all steps must be defined
npx cucumber-js --profile dynamic --dry-run

# 3. Run dynamic showcase scenarios end-to-end
npm run test:dynamic
```

Expected output for `test:dynamic`:
```
2 scenarios (2 passed)
  Register with dynamically generated credentials    ✓
  Submit contact form with dynamic sender identity   ✓
```

---

## Success Criteria Checklist (from spec)

- [ ] All existing tests compile (`npm run typecheck` passes)
- [ ] `{{unique_email}}` in a feature file step resolves to a unique email at runtime
- [ ] `npm run test:dynamic` runs and passes both showcase scenarios
- [ ] No duplicate email generation logic in `RandomDataGenerator` or `UserBuilder`
- [ ] `BasePage.safeGoto()` uses `load` state
- [ ] `forNetworkIdle()` is marked `@deprecated`
- [ ] `DataManager` teardown failures appear in test output (visible `console.warn`)

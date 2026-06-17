# Refactor Design: Foundation Consolidation + Utility Integration + Showcase

**Date:** 2026-06-17  
**Branch:** dev  
**Approach:** Foundation-first, layer by layer (Approach 1)

---

## Overview

Three-layer refactor of the Playwright + Cucumber test automation framework:

1. **Layer 0 — Foundation Consolidation:** Deduplicate email generation, standardize wait strategy, improve teardown visibility
2. **Layer 1 — Utility Integration:** Wire `resolveTemplate()` transparently into all step definitions
3. **Layer 2 — Showcase Scenarios:** Demonstrate the placeholder system end-to-end with real executable tests

---

## Layer 0 — Foundation Consolidation

### 0a. Email Generation — Single Source of Truth

**Problem:** Three independent implementations produce unique emails:
- `RandomDataGenerator.user()` → `${firstName}.${lastName}.${Date.now()}@test.local`
- `UserBuilder` → same pattern, duplicated
- `dynamicUtils.uniqueEmail(prefix)` → `${prefix}.${Date.now()}@test.local`

**Solution:** `dynamicUtils.uniqueEmail()` becomes the canonical implementation. `RandomDataGenerator` and `UserBuilder` delegate to it.

**Files affected:**
- `src/utils/RandomDataGenerator.ts` — replace inline email construction with `uniqueEmail()`
- `src/data/builders/UserBuilder.ts` — same delegation
- `src/utils/dynamicUtils.ts` — no change (already canonical)

**No behavior change** — same output format, same uniqueness guarantee.

---

### 0b. Wait Strategy — Standardize on `forLoad()`

**Problem:** Inconsistent wait states across the framework:
- `BasePage.safeGoto()` uses `domcontentloaded` (misses JS-rendered content)
- `WaitHelper.forLoad()` uses `load` event — preferred per inline comments
- `WaitHelper.forNetworkIdle()` — documented as flaky with polling/analytics traffic

**Solution:**
- `BasePage.safeGoto()` switches to `load` state
- `WaitHelper.forNetworkIdle()` gets `@deprecated` JSDoc with migration note pointing to `forLoad()`

**Files affected:**
- `src/pages/BasePage.ts` — change `domcontentloaded` → `load`
- `src/utils/WaitHelper.ts` — add `@deprecated` on `forNetworkIdle()`

**No page-level changes needed** — all pages inherit from `BasePage`.

---

### 0c. DataManager Teardown — Log Failures

**Problem:** `DataManager.teardownAll()` silently swallows cleanup errors. Orphaned accounts accumulate in CI without any signal.

**Solution:** Add `console.warn()` inside the catch block with the account ID and error message. Teardown remains best-effort — no change to control flow.

**Files affected:**
- `src/data/DataManager.ts` — add warn log in teardown catch block

---

## Layer 1 — Utility Integration

### 1a. Transparent Placeholder Resolution in Steps

**Goal:** Any string parameter in any step definition can use `{{placeholder}}` syntax. Resolution happens transparently — steps receive the resolved value, no feature file changes required.

**Supported placeholders** (from `dynamicValueUtils.ts`):
| Placeholder | Resolves to |
|---|---|
| `{{today}}` | Today's date (YYYY-MM-DD) |
| `{{tomorrow}}` | Tomorrow's date (YYYY-MM-DD) |
| `{{yesterday}}` | Yesterday's date (YYYY-MM-DD) |
| `{{unique}}` | UUID v4 |
| `{{unique_email}}` | Unique timestamped email |
| `{{unique_username}}` | Unique timestamped username |

**Implementation:** New file `support/resolveParams.ts` exports `r()`:

```typescript
import { resolveTemplate } from '@utils/dynamicValueUtils';
export function r(value: string): string {
  return resolveTemplate(value);
}
```

Every step definition wraps string params with `r()`:

```typescript
// Before
When('I register with email {string}', async function(email: string) { ... })

// After
When('I register with email {string}', async function(rawEmail: string) {
  const email = r(rawEmail);
  ...
})
```

**Files affected:**
- `support/resolveParams.ts` — new file
- `steps/ui/auth.steps.ts` — wrap string params
- `steps/ui/cart.steps.ts` — wrap string params
- `steps/ui/checkout.steps.ts` — wrap string params
- `steps/ui/contact.steps.ts` — wrap string params
- `steps/ui/product.steps.ts` — wrap string params
- `steps/api/accounts.steps.ts` — wrap string params
- `steps/api/products.steps.ts` — wrap string params

**Constraint:** Steps that accept non-string params (numbers, booleans) are untouched.

---

### 1b. Barrel Import Convention

`src/utils/utils.ts` already re-exports all new utility modules. New code (e.g., `resolveParams.ts`, future steps) imports from `@utils/utils`. Existing imports are not mass-migrated — they stay as-is to avoid noise in the diff.

---

## Layer 2 — Showcase Scenarios

### 2a. New Feature Scenarios

**Scenario 1** — `features/ui/auth.feature`:
```gherkin
@smoke @dynamic
Scenario: Register with dynamically generated credentials
  When I register a new account with email "{{unique_email}}" and username "{{unique_username}}"
  Then I should be logged in successfully
```

**Scenario 2** — `features/ui/cart.feature`:
```gherkin
@smoke @dynamic
Scenario: Complete order with unique user data
  Given I am registered as "{{unique_email}}"
  When I add a product to the cart
  And I proceed to checkout with name "{{unique_username}}"
  Then the order should be confirmed
```

Both scenarios are real executable tests, not documentation stubs.

> **Implementation note:** The showcase scenarios use step text that matches existing step definitions where possible. Any step that does not yet exist must be added alongside the feature file. The implementation plan will identify which steps are new vs. reused.

---

### 2b. Tag Strategy Additions

Two new tags added to `README.md` tag reference:

| Tag | Meaning |
|---|---|
| `@dynamic` | Scenario uses `{{placeholder}}` data; verifies parallel-safe dynamic resolution |
| `@deprecated` | Scenario is scheduled for removal (use alongside `@skip`) |

Existing tags (`@smoke`, `@regression`, `@flaky`, `@skip`, `@db`, `@api`) are unchanged.

---

### 2c. New `dynamic` Cucumber Profile

**`cucumber.js`:**
```javascript
dynamic: `--profile ui --tags @dynamic`
```

**`package.json`:**
```json
"test:dynamic": "npx cucumber-js --profile dynamic"
```

---

## Architecture Impact

| Layer | Risk | Reviewer notes |
|---|---|---|
| Layer 0 | Low | Pure consolidation — behavior unchanged, output identical |
| Layer 1 | Low-Medium | `r()` wrapper is additive; only risk is a step missing a wrap |
| Layer 2 | Low | New scenarios + config entries; no existing code touched |

### What is NOT changed

- Page object internals (selectors, assertions)
- Component objects under `src/locator/components/`
- API layer (`src/api/`)
- Database layer (`src/db/`)
- Flows (`src/flows/`) — already refactored in prior commits
- Existing step logic beyond the `r()` wrapper addition

---

## Success Criteria

- [ ] All existing tests pass after Layer 0 changes
- [ ] `{{unique_email}}` in a feature file step resolves to a unique email at runtime
- [ ] `npm run test:dynamic` runs and passes both showcase scenarios
- [ ] No duplicate email generation logic remains in `RandomDataGenerator` or `UserBuilder`
- [ ] `BasePage.safeGoto()` uses `load` state
- [ ] `forNetworkIdle()` is marked `@deprecated`
- [ ] `DataManager` teardown failures appear in test output

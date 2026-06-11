# Design: Production-Grade Playwright + Cucumber Test Automation Framework

**Date:** 2026-06-11  
**Author:** Huynh Minh Nghia  
**Status:** Approved

---

## Overview

A complete, production-ready end-to-end test automation framework for `https://automationexercise.com/` covering UI, REST API, and integrated UI+API flows. Built with TypeScript (strict), Cucumber as the BDD runner, Playwright as the browser library, and Allure for reporting.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| BDD Runner | `@cucumber/cucumber` |
| Browser library | `playwright` (not `@playwright/test` runner) |
| Reporting | `allure-cucumberjs` + Playwright HTML as fallback |
| Fake data | `@faker-js/faker` |
| Mail server | MailHog (Docker, free) |
| DB client | PostgreSQL (`pg`) — pluggable |
| Cloud grid | BrowserStack (`browserstack-node-sdk`) behind `RUN_ON=browserstack` |
| CI/CD | GitHub Actions (primary), GitLab CI + Jenkinsfile as alternatives |
| Containers | Docker + docker-compose (opt-in) |
| Package manager | npm |

---

## Architecture

### Layer Stack (top → bottom)

```
Gherkin (.feature files)
        ↓
Step Definitions  (steps/)
        ↓
Flows / Facades   (src/flows/)       ← orchestrate multi-page business operations
        ↓
Page Objects + Components  (src/pages/, src/components/)
        ↓
Locators  (src/locators/)            ← no raw selectors above this line
        ↓
Playwright Browser API               ← held by CucumberWorld
```

### CucumberWorld (`src/fixtures/world.ts`)

Central context object injected into every step definition. Holds:
- `browser` — Playwright Browser instance
- `context` — BrowserContext (fresh per scenario)
- `page` — Page (fresh per scenario)
- `configManager` — ConfigManager singleton
- `apiClient` — typed API client
- `dbClient` — DB connection (only open when tagged `@db`)
- `mailClient` — MailHog client

### ConfigManager (Singleton)

Reads `.env.<ENV>` at startup via `dotenv`. All config flows through it — no hard-coded values anywhere:
- `BASE_URL`, `API_BASE_URL`
- `ENV` (dev / staging / prod)
- `BROWSER`, `HEADLESS`, `SLOW_MO`, `VIEWPORT_*`, `LOCALE`, `TIMEZONE`
- `RUN_ON` (local / browserstack)
- `BS_USERNAME`, `BS_ACCESS_KEY`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_API_PORT`
- `RETRY_COUNT`

---

## Folder Structure

```
project-root/
├─ src/
│  ├─ pages/            # Page objects (one per page)
│  ├─ components/       # Reusable component objects
│  ├─ locators/         # Locator definitions + dynamic builders
│  ├─ flows/            # Business facades
│  ├─ api/              # API clients + request/response models
│  ├─ db/               # DB connection + query helpers
│  ├─ data/             # Builders, faker factories, fixtures, upload files
│  ├─ utils/            # Waits, file utils, cookie utils, mail client, generators
│  ├─ config/           # ConfigManager, env loading, BrowserStack capabilities
│  └─ fixtures/         # CucumberWorld + custom fixtures
├─ features/
│  ├─ ui/               # UI .feature files
│  └─ api/              # API .feature files
├─ steps/
│  ├─ ui/               # UI step definitions
│  ├─ api/              # API step definitions
│  └─ hooks.ts          # Before/After/BeforeAll/AfterAll
├─ config/
│  ├─ .env.dev
│  ├─ .env.staging
│  ├─ .env.prod
│  └─ .env.example
├─ reports/             # allure-results, html, traces, videos
├─ docker/              # Dockerfile, docker-compose.yml
├─ docs/
├─ .github/workflows/
├─ cucumber.js          # Cucumber profiles
├─ playwright.config.ts # Retained for Allure/HTML reporter wiring
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
├─ package.json
└─ README.md
```

---

## Design Patterns

### Page Object + Component Object
- `BasePage` abstract class: `navigate()`, `waitForLoad()`, `switchToPage()`, `handleNewTab()`
- Pages: `HomePage`, `LoginPage`, `RegisterPage`, `ProductsPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, `ContactPage`, `AccountCreatedPage`
- Components: `Header`, `Footer`, `ProductCard`, `Modal`, `DataGrid`, `Navbar`, `FormField`, `AlertBanner`

### Locator Strategy (Strategy pattern)
- `LocatorStrategy` interface with `CssStrategy`, `XPathStrategy`, `RoleStrategy` implementations
- `src/locators/` exports named locator maps per page/component
- Dynamic builders: `productCard(name)`, `gridRow(index)`, `formField(label)`
- Demonstrates all selector types: CSS, XPath (relative + axes: `following-sibling`, `ancestor`, `parent`, `descendant`, `preceding`), id/name/class, role/text/testid

### Factory
- `PageFactory.get(name, page)` → correct page object
- `ApiClientFactory.get(resource)` → correct API client

### Builder
- `UserBuilder`, `ProductBuilder`, `AddressBuilder`, `CardBuilder` with `@faker-js/faker`
- Fluent API: `.withEmail().withPassword().withName().build()`

### Facade / Flow
- `AuthFlow` — `register()`, `login()`, `logout()`
- `ProductFlow` — `searchAndAddToCart()`, `assertProductInGrid()`
- `OrderFlow` — `placeOrder()`, `verifyOrderConfirmation()`
- `ContactFlow` — `submitContactForm()`

### Singleton
- `ConfigManager` — config loading
- `BrowserManager` — browser lifecycle (or BrowserStack session)
- `DbConnectionManager` — PostgreSQL pool

---

## Test Coverage

### UI Features (`features/ui/`)
| Feature | Tags |
|---|---|
| `auth.feature` | `@ui @smoke @regression` |
| `products.feature` | `@ui @regression` |
| `cart.feature` | `@ui @regression` |
| `checkout.feature` | `@ui @regression` |
| `contact.feature` | `@ui @upload @regression` |
| `integrated.feature` | `@ui @api @regression` |

### API Features (`features/api/`)
| Feature | Tags |
|---|---|
| `products-api.feature` | `@api @smoke @regression` |
| `accounts-api.feature` | `@api @smoke @regression` |
| `cart-api.feature` | `@api @regression` |

### Integrated Scenarios
- Create account via API → login via UI
- Register via UI → verify account via API

---

## Hooks (`steps/hooks.ts`)

| Hook | Scope | Responsibility |
|---|---|---|
| `BeforeAll` | Suite | Launch browser / open BrowserStack session |
| `Before` | Scenario | New context + page, inject into World, start trace + video |
| `After` | Scenario | Screenshot + attach trace/video on failure; clear cookies/storage/temp files; API/DB teardown |
| `AfterAll` | Suite | Close browser; flush Allure; close DB pool |
| `Before({tags: '@db'})` | Tagged | Open DB connection |
| `Before({tags: '@upload'})` | Tagged | Copy sample upload files to temp dir |
| `Before({tags: '@api'})` | Tagged | Set API base headers |

---

## Reporting

- **Allure** (`allure-cucumberjs`): steps, attachments (screenshot, video, trace, request/response, DB query), environment info, `@flaky` category
- npm scripts: `report` → generate; `report:open` → serve
- Traces captured on failure and on every retry of a `@flaky` scenario

---

## Flaky Test Handling

- `@flaky` tag → auto-retry up to `RETRY_COUNT` (env var, default 2)
- Smart waits only (`waitForSelector`, `waitForResponse`, `waitForLoadState`) — no `page.waitForTimeout` except documented exceptions
- Quarantine surface in Allure categories

---

## Data Management

- `DataManager` singleton: creates, tracks, and tears down test data
- Sources: faker builders (dynamic), JSON fixtures in `src/data/fixtures/` (static), randomuser.me (live online)
- MailHog client (`src/utils/mailClient.ts`): polls MailHog HTTP API to read verification/confirmation emails

---

## File Upload

- `FileUploadHelper` in `src/utils/`: `uploadSingle(page, selector, file)`, `uploadMultiple()`
- Sample files in `src/data/files/` (`.jpg`, `.pdf`, `.txt`)

---

## DataTable / DataGrid

- `DataGrid` component reads, searches, sorts, paginates, and asserts on HTML tables
- Cucumber `DataTable` mapped to typed objects via helper in `src/utils/dataTableParser.ts`

---

## Navigation & Page Switching

- `NavigationHelper`: `safeGoto()` (retries + network-idle wait + URL assertion)
- Fluent page switching: methods return next page object
- Multi-site: `ConfigManager.switchSite(alias)` swaps `BASE_URL`
- New tab/popup: `context.waitForEvent('page')` wrapped in `NavigationHelper.waitForNewTab()`

---

## Cookie & Storage State

- `CookieHelper`: get/set/clear/inject cookies
- Persisted `storageState` for authenticated sessions (`src/data/fixtures/auth.state.json`)
- `After` hook clears all cookies, localStorage, sessionStorage

---

## BrowserStack Integration

- `RUN_ON=browserstack` activates `BrowserStackManager` instead of local `BrowserManager`
- Capabilities matrix: `src/config/browserstack.capabilities.ts`
- Credentials: `BS_USERNAME` + `BS_ACCESS_KEY` env vars

---

## Database Testing

- `DbConnectionManager` (Singleton, PostgreSQL `pg`)
- Parameterized queries only — no string interpolation
- Tagged `@db`; connection opened in tagged `Before`, closed in `AfterAll`
- Used to verify UI/API actions persisted correctly

---

## Parallel Execution

- Cucumber `--parallel N` (configured in `cucumber.js` profiles)
- World is per-worker — no shared mutable state
- `N` controlled by `WORKERS` env var

---

## Docker

- `docker/Dockerfile` based on `mcr.microsoft.com/playwright` official image
- `docker/docker-compose.yml`: `playwright-tests` + `mailhog` + `postgres`
- Opt-in: `docker-compose up --build`

---

## CI/CD

### GitHub Actions (`.github/workflows/playwright.yml`)
- Matrix: `[ubuntu-latest, windows-latest]` × `[chromium, firefox, webkit]`
- Steps: checkout → setup Node → cache npm + browsers → lint → test → upload Allure results + traces → publish HTML report

### Alternatives
- `gitlab-ci.yml` — same matrix using GitLab runners
- `Jenkinsfile` — declarative pipeline with parallel stages

---

## npm Scripts

| Script | Command |
|---|---|
| `test` | Run all tests |
| `test:ui` | `--tags @ui` |
| `test:api` | `--tags @api` |
| `test:smoke` | `--tags @smoke` |
| `test:regression` | `--tags @regression` |
| `test:parallel` | `--parallel 4` |
| `test:bs` | `RUN_ON=browserstack` |
| `report` | Generate Allure report |
| `report:open` | Serve Allure report |
| `lint` | ESLint + Prettier check |
| `clean` | Remove reports/, allure-results/, tmp/ |

---

## Coding Standards

- TypeScript strict; ESLint + Prettier configured
- No selectors or waits in step definitions — components/pages only
- No `page.waitForTimeout` except documented exceptions
- All config via env/files; no secrets committed
- Meaningful Gherkin: `Given/When/Then`, `Scenario Outline` with `Examples`, `Background`, tags

---

## Constraints & Decisions

- **Cucumber is the runner** (not `@playwright/test`); Playwright used as a library only
- **No shared mutable state** across parallel workers
- **No hard-coded URLs** anywhere — all from ConfigManager
- **Parameterized DB queries only** — prevents SQL injection
- **Opt-in Docker and BrowserStack** — local runs unchanged with zero env vars set

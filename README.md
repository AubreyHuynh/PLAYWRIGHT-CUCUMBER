# Playwright + Cucumber BDD Framework

Production-grade end-to-end test automation framework for [AutomationExercise](https://automationexercise.com/).  
Covers UI (Playwright), REST API (Axios), and integrated UI+API scenarios using Cucumber BDD.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript (strict) | Language |
| Playwright | Browser automation engine |
| Cucumber | BDD layer (Gherkin `.feature` files) |
| Allure | Primary reporting |
| Faker.js | Test data generation |
| Axios | HTTP API client |
| dotenv | Environment configuration |
| Docker + MailHog | Containerised SMTP for email testing |
| BrowserStack | Cloud cross-browser grid (opt-in) |
| GitHub Actions | Primary CI/CD |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Copy env file
cp .env.example config/.env.dev

# 4. Run all tests
npm test
```

---

## Run Matrix

| Command | What it runs |
|---------|-------------|
| `npm test` | All tests (default profile) |
| `npm run test:ui` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | @smoke tagged tests |
| `npm run test:parallel` | All tests in parallel (4 workers) |
| `npm run test:dynamic` | @dynamic (dynamic value) showcase scenarios |
| `npm run test:bs` | BrowserStack (set BS_* env vars) |
| `npm run report` | Generate + open Allure report |
| `npm run lint` | ESLint check |
| `npm run clean` | Remove all report/result directories |

### Environment selection

```bash
ENV=staging npm test
ENV=prod npm run test:smoke
```

### Browser selection

```bash
BROWSER=firefox npm test
BROWSER=webkit npm test
```

### Headless toggle

```bash
HEADLESS=false npm test   # headed (shows browser window)
```

### Test Tags

| Tag | Purpose |
|-----|---------|
| `@smoke` | Fast subset of critical user journeys |
| `@regression` | Full test suite for release validation |
| `@flaky` | Known to be environment-dependent; skipped in CI |
| `@dynamic` | Uses `{{placeholder}}` data; verifies parallel-safe dynamic value resolution |
| `@deprecated` | Scenario is scheduled for removal — use alongside `@skip` |
| `@skip` | Excluded from all profiles |

---

## Folder Structure

```
├── src/
│   ├── api/           # Axios-based API clients
│   ├── components/    # Reusable UI components (Header, Modal, DataGrid, ProductCard)
│   ├── config/        # ConfigManager singleton (reads .env files)
│   ├── data/          # Builders (User/Product/Address/Card), DataManager, fixtures
│   ├── db/            # DbManager singleton + pluggable adapters (pg, mysql)
│   ├── fixtures/      # CustomWorld (Cucumber World with Playwright browser)
│   ├── flows/         # Facade layer: UserFlows, ProductFlows, OrderFlows, PageFactory
│   ├── locators/      # LocatorStrategy (CSS/XPath/role/text/testid) + CommonLocators
│   ├── pages/         # Page Objects (Home, Login, Register, Products, Cart, Checkout, Contact)
│   └── utils/         # WaitHelper, NavigationHelper, CookieHelper, FileHelper, MailClient
├── features/
│   ├── ui/            # UI .feature files
│   └── api/           # API + integrated .feature files
├── steps/
│   ├── ui/            # Step definitions for UI scenarios
│   ├── api/           # Step definitions for API scenarios
│   └── hooks.ts       # Before/After/BeforeAll/AfterAll hooks
├── config/            # .env.dev  .env.staging  .env.prod
├── docker/            # Dockerfile + docker-compose.yml
├── .github/workflows/ # GitHub Actions CI
├── cucumber.js        # Cucumber profiles
├── playwright.config.ts
└── tsconfig.json
```

---

## Design Patterns

| Pattern | Where used |
|---------|-----------|
| Page Object | `src/pages/` |
| Component Object | `src/components/` |
| Factory | `src/flows/PageFactory.ts` |
| Builder | `src/data/builders/` |
| Singleton | ConfigManager, DbManager, DataManager |
| Facade | `src/flows/` (UserFlows, ProductFlows, OrderFlows) |
| Strategy | `src/locators/LocatorStrategy.ts` |

---

## Dynamic Value Utilities

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

---

## Docker

```bash
# Run tests in Docker with MailHog SMTP
cd docker
docker compose up --build

# MailHog web UI available at http://localhost:8025
```

---

## BrowserStack

```bash
# Set credentials in .env or environment
export BS_USERNAME=your_username
export BS_ACCESS_KEY=your_key

RUN_ON=browserstack npm test
```

---

## Allure Report

```bash
npm run report          # generate + open
npm run report:generate # generate only (for CI artifact upload)
```

---

## CI/CD

- **GitHub Actions**: `.github/workflows/test.yml` — matrix across Ubuntu/Windows × Chromium/Firefox
- **GitLab CI**: `.gitlab-ci.yml`
- **Jenkins**: `Jenkinsfile`

---

## Notes on Dependent Scenarios

Scenarios that require ordered state (e.g. register → login → checkout) use `Background:` blocks or `Given` steps that call the API to pre-create state rather than chaining UI scenarios. This keeps most tests independent while supporting the few that are inherently ordered. Tag dependent scenarios with `@depends` and document the chain in the feature file comment.

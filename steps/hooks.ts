import { Before, After, BeforeAll, AfterAll, AfterStep, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(60_000);
import type { CustomWorld } from '../src/fixtures/CustomWorld';
import { DataManager } from '../src/data/DataManager';
import { DbManager } from '../src/db/DbManager';
import { AccountsApi } from '../src/api/endpoints/AccountsApi';
import { FileHelper } from '../src/utils/FileHelper';
import * as fs from 'fs';
import * as path from 'path';

BeforeAll(async function () {
  const api = new AccountsApi();
  DataManager.getInstance().registerApiClient({
    deleteAccount: async (email, password) => {
      await api.deleteAccount(email, password);
    },
  });

  // Write Allure environment info so the report shows run context
  const cfg = {
    BASE_URL: process.env.BASE_URL || 'https://automationexercise.com',
    ENV: process.env.ENV || 'dev',
    BROWSER: process.env.BROWSER || 'chromium',
    RUN_ON: process.env.RUN_ON || 'local',
    CI: process.env.CI || 'false',
  };
  const resultsDir = path.resolve(process.cwd(), 'allure-results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  const lines = Object.entries(cfg)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), lines, 'utf-8');
});

Before({ tags: '@db' }, async function (this: CustomWorld) {
  await DbManager.getInstance().connect();
});

/** @upload — ensure the upload dir exists before the scenario runs */
Before({ tags: '@upload' }, async function (this: CustomWorld) {
  FileHelper.ensureDownloadDir();
});

/** @api — no browser needed; skip browser launch for pure API scenarios */
Before({ tags: '@api' }, async function (this: CustomWorld) {
  // API scenarios use axios directly; browser init is still called by the
  // general Before hook above but the page will simply sit unused.
  // This hook is a hook point for future API-specific setup (e.g. token refresh).
});

Before(async function (this: CustomWorld) {
  await this.initBrowser();
});

AfterStep(async function (this: CustomWorld, { result }: { result: { status: string; message?: string } }) {
  if (result.status === 'FAILED' && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
  }
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const status = scenario.result?.status;

  if (status === 'FAILED' && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');

    const tracePath = `test-results/trace-${Date.now()}.zip`;
    await this.context?.tracing.stop({ path: tracePath });
    if (fs.existsSync(tracePath)) {
      const trace = fs.readFileSync(tracePath);
      await this.attach(trace, 'application/zip');
    }
  } else {
    await this.context?.tracing.stop();
  }

  await this.closeBrowser();
});

After({ tags: '@db' }, async function (this: CustomWorld) {
  await DbManager.getInstance().disconnect();
});

AfterAll(async function () {
  await DataManager.getInstance().teardownAll();
  FileHelper.cleanDownloads();
});

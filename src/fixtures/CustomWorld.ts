import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { ConfigManager } from '../config/ConfigManager';
import * as path from 'path';
import * as fs from 'fs';

export interface ScenarioData {
  [key: string]: unknown;
}

/** Path where authenticated storage state is persisted for session reuse */
const AUTH_STATE_PATH = path.resolve(process.cwd(), '.auth/user.json');

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  scenarioData: ScenarioData = {};
  createdUserEmail?: string;
  createdUserPassword?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initBrowser(): Promise<void> {
    const cfg = ConfigManager.getInstance().get();

    if (cfg.runOn === 'browserstack') {
      // Connect to BrowserStack remote grid via CDP WebSocket
      // BS_USERNAME and BS_ACCESS_KEY are read from config/environment
      const capabilities = {
        browserName: cfg.browser === 'webkit' ? 'safari' : cfg.browser,
        'bstack:options': {
          os: 'Windows',
          osVersion: '11',
          browserVersion: 'latest',
          projectName: cfg.browserstack.project,
          buildName: cfg.browserstack.build,
          sessionName: 'Playwright Cucumber Run',
          userName: cfg.browserstack.username,
          accessKey: cfg.browserstack.accessKey,
        },
      };
      const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(capabilities))}`;
      this.browser = await chromium.connect(wsEndpoint);
    } else {
      const launchOptions = { headless: cfg.headless, slowMo: 0 };
      switch (cfg.browser) {
        case 'firefox':
          this.browser = await firefox.launch(launchOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(launchOptions);
          break;
        default:
          this.browser = await chromium.launch(launchOptions);
      }
    }

    // Reuse saved auth state if it exists (skips login for non-auth tests)
    const authStateExists = fs.existsSync(AUTH_STATE_PATH);

    this.context = await this.browser.newContext({
      locale: cfg.locale,
      timezoneId: cfg.timezone,
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'test-results/videos' },
      acceptDownloads: true,
      ...(authStateExists ? { storageState: AUTH_STATE_PATH } : {}),
    });

    await this.context.tracing.start({ screenshots: true, snapshots: true });
    this.page = await this.context.newPage();
  }

  /** Persist current auth cookies/localStorage for reuse across scenarios */
  async saveAuthState(): Promise<void> {
    const dir = path.dirname(AUTH_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await this.context.storageState({ path: AUTH_STATE_PATH });
  }

  async closeBrowser(): Promise<void> {
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.clearCookies();
      await this.context.tracing.stop();
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  set(key: string, value: unknown): void {
    this.scenarioData[key] = value;
  }

  get<T>(key: string): T {
    return this.scenarioData[key] as T;
  }
}

setWorldConstructor(CustomWorld);

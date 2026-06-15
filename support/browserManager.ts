import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { ConfigManager } from '../src/config/ConfigManager';
import { AuthManager } from '../saveAuth/authManager';

export class BrowserManager {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  private authManager = new AuthManager();

  async init(): Promise<void> {
    const cfg = ConfigManager.getInstance().get();

    if (cfg.runOn === 'browserstack') {
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

    this.context = await this.browser.newContext({
      locale: cfg.locale,
      timezoneId: cfg.timezone,
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'test-results/videos' },
      acceptDownloads: true,
      ...this.authManager.storageStateOption(),
    });

    await this.context.tracing.start({ screenshots: true, snapshots: true });
    this.page = await this.context.newPage();
  }

  async saveAuthState(): Promise<void> {
    await this.authManager.save(this.context);
  }

  async close(): Promise<void> {
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
}

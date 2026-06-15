import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { BrowserManager } from './browserManager';

export interface ScenarioData {
  [key: string]: unknown;
}

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  scenarioData: ScenarioData = {};
  createdUserEmail?: string;
  createdUserPassword?: string;

  private browserManager = new BrowserManager();

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initBrowser(): Promise<void> {
    await this.browserManager.init();
    this.browser = this.browserManager.browser;
    this.context = this.browserManager.context;
    this.page = this.browserManager.page;
  }

  async saveAuthState(): Promise<void> {
    await this.browserManager.saveAuthState();
  }

  async closeBrowser(): Promise<void> {
    await this.browserManager.close();
  }

  set(key: string, value: unknown): void {
    this.scenarioData[key] = value;
  }

  get<T>(key: string): T {
    return this.scenarioData[key] as T;
  }
}

setWorldConstructor(CustomWorld);

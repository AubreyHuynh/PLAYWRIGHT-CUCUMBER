import * as dotenv from 'dotenv';
import * as path from 'path';

export interface FrameworkConfig {
  env: string;
  baseUrl: string;
  apiBaseUrl: string;
  headless: boolean;
  browser: string;
  workers: number;
  retries: number;
  locale: string;
  timezone: string;
  runOn: 'local' | 'browserstack';
  browserstack: {
    username: string;
    accessKey: string;
    project: string;
    build: string;
  };
  db: {
    type: 'pg' | 'mysql' | 'mssql' | 'none';
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: FrameworkConfig;

  private constructor() {
    const env = process.env.ENV || 'dev';
    const envFile = path.resolve(process.cwd(), `config/.env.${env}`);
    dotenv.config({ path: envFile });

    this.config = {
      env,
      baseUrl: process.env.BASE_URL || 'https://automationexercise.com',
      apiBaseUrl: process.env.API_BASE_URL || 'https://automationexercise.com/api',
      headless: process.env.HEADLESS !== 'false',
      browser: process.env.BROWSER || 'chromium',
      workers: parseInt(process.env.WORKERS || '2'),
      retries: parseInt(process.env.RETRIES || '1'),
      locale: process.env.LOCALE || 'en-US',
      timezone: process.env.TIMEZONE || 'America/New_York',
      runOn: (process.env.RUN_ON as 'local' | 'browserstack') || 'local',
      browserstack: {
        username: process.env.BS_USERNAME || '',
        accessKey: process.env.BS_ACCESS_KEY || '',
        project: process.env.BS_PROJECT || 'AutomationExercise',
        build: process.env.BS_BUILD || 'local-build',
      },
      db: {
        type: (process.env.DB_TYPE as FrameworkConfig['db']['type']) || 'none',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'testdb',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      },
      mail: {
        host: process.env.MAIL_HOST || 'localhost',
        port: parseInt(process.env.MAIL_PORT || '1025'),
        secure: process.env.MAIL_SECURE === 'true',
      },
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get(): FrameworkConfig {
    return this.config;
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  isBrowserStack(): boolean {
    return this.config.runOn === 'browserstack';
  }
}

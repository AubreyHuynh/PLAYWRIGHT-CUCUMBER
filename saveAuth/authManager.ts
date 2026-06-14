import { BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SESSION_DIR = path.resolve(process.cwd(), 'saveAuth/session');

export class AuthManager {
  private sessionPath: string;

  constructor(sessionName = 'user') {
    this.sessionPath = path.join(SESSION_DIR, `${sessionName}.json`);
  }

  exists(): boolean {
    return fs.existsSync(this.sessionPath);
  }

  storageStateOption(): { storageState: string } | Record<string, never> {
    return this.exists() ? { storageState: this.sessionPath } : {};
  }

  async save(context: BrowserContext): Promise<void> {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }
    await context.storageState({ path: this.sessionPath });
  }

  clear(): void {
    if (fs.existsSync(this.sessionPath)) {
      fs.unlinkSync(this.sessionPath);
    }
  }
}

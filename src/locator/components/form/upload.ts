import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Upload extends BaseComponent {
  constructor(page: Page, rootSelector = 'input[type="file"]') {
    super(page, rootSelector);
  }

  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.locator(selector).setInputFiles(filePath);
  }

  async uploadFiles(selector: string, filePaths: string[]): Promise<void> {
    await this.page.locator(selector).setInputFiles(filePaths);
  }

  async clearFiles(selector: string): Promise<void> {
    await this.page.locator(selector).setInputFiles([]);
  }

  async uploadByLabel(label: string, filePath: string): Promise<void> {
    await this.page.getByLabel(label).setInputFiles(filePath);
  }
}

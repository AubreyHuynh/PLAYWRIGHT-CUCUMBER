import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Tag extends BaseComponent {
  constructor(page: Page, rootSelector = '[data-tag], .tag, .badge') {
    super(page, rootSelector);
  }

  async getText(): Promise<string> {
    return (await this.root.first().textContent()) || '';
  }

  async getAllTexts(): Promise<string[]> {
    const texts = await this.root.allTextContents();
    return texts.map((t) => t.trim());
  }

  async clickTag(text: string): Promise<void> {
    await this.root.filter({ hasText: text }).click();
  }

  async isTagVisible(text: string): Promise<boolean> {
    return this.root.filter({ hasText: text }).isVisible();
  }
}

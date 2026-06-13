import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class Modal extends BaseComponent {
  constructor(page: Page, rootSelector = '.modal') {
    super(page, rootSelector);
  }

  async getTitle(): Promise<string> {
    return (await this.within('.modal-title').textContent()) || '';
  }

  async clickButton(buttonText: string): Promise<void> {
    await this.within('.modal-footer').getByRole('button', { name: buttonText }).click();
  }

  async close(): Promise<void> {
    const closeBtn = this.within('button.close, [data-dismiss="modal"]');
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  async waitForModal(timeout = 5000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }
}

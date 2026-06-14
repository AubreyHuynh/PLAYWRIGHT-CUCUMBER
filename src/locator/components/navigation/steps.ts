import { Page } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export class Steps extends BaseComponent {
  constructor(page: Page, rootSelector = '[role="progressbar"], .steps, .stepper') {
    super(page, rootSelector);
  }

  async getCurrentStep(): Promise<string> {
    return (await this.root.locator('.active, [aria-current="step"]').textContent()) || '';
  }

  async getStepCount(): Promise<number> {
    return this.root.locator('.step, li').count();
  }

  async clickStep(stepLabel: string): Promise<void> {
    await this.root.getByText(stepLabel).click();
  }

  async isStepCompleted(stepLabel: string): Promise<boolean> {
    const step = this.root.filter({ hasText: stepLabel });
    const classes = await step.getAttribute('class');
    return (classes ?? '').includes('completed') || (classes ?? '').includes('done');
  }
}

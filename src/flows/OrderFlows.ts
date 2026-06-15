import { Page } from '@playwright/test';
import { PageManager as PageFactory } from '../../support/pageManager';
import { Card } from '../data/builders/CardBuilder';

export class OrderFlows {
  private factory: PageFactory;

  constructor(private page: Page) {
    this.factory = new PageFactory(page);
  }

  async placeOrder(card: Card, comment = 'Test order'): Promise<void> {
    const cart = this.factory.cart();
    await cart.navigate();
    await cart.proceedToCheckout();

    const checkout = this.factory.checkout();
    await checkout.addComment(comment);
    await checkout.placeOrder();
    await checkout.fillPayment(card);
    await checkout.confirmPayment();
    await checkout.assertOrderPlaced();
  }
}

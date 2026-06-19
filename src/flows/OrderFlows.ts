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
    await checkout.clickPlaceOrder();

    const payment = this.factory.payment();
    await payment.fillPayment(card);
    await payment.confirmPayment();

    await this.factory.orderConfirmed().assertOrderPlaced();
  }
}

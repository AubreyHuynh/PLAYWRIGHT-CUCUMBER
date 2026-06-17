import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';
import { CardBuilder } from '../../src/data/builders/CardBuilder';

When('I place an order with payment details', async function (this: CustomWorld) {
  const card = new CardBuilder().build();
  const factory = new PageManager(this.page);
  const checkout = factory.checkout();
  await checkout.addComment('Automated test order');
  await checkout.clickPlaceOrder();

  const payment = factory.payment();
  await payment.fillPayment(card);
  await payment.confirmPayment();
});

Then('the order should be placed successfully', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.orderConfirmed().assertOrderPlaced();
});

Then('I can download the invoice', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.orderConfirmed().downloadInvoice();
});

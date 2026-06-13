import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../src/fixtures/CustomWorld';
import { PageFactory } from '../../src/flows/PageFactory';
import { CardBuilder } from '../../src/data/builders/CardBuilder';

When('I place an order with payment details', async function (this: CustomWorld) {
  const card = new CardBuilder().build();
  const factory = new PageFactory(this.page);
  const checkout = factory.checkout();
  await checkout.addComment('Automated test order');
  await checkout.placeOrder();
  await checkout.fillPayment(card);
  await checkout.confirmPayment();
});

Then('the order should be placed successfully', async function (this: CustomWorld) {
  const factory = new PageFactory(this.page);
  await factory.checkout().assertOrderPlaced();
});

Then('I can download the invoice', async function (this: CustomWorld) {
  const factory = new PageFactory(this.page);
  await factory.checkout().downloadInvoice();
});

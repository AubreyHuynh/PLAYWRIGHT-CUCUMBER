import { Given, When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { PageManager } from '../../support/pageManager';
import { faker } from '@faker-js/faker';

Given('I am on the contact page', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.contact().navigate();
});

When('I fill the contact form with valid data', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory
    .contact()
    .fillForm(faker.person.fullName(), faker.internet.email(), faker.lorem.sentence(5), faker.lorem.paragraph());
});

When('I upload {string} as attachment', async function (this: CustomWorld, filename: string) {
  const factory = new PageManager(this.page);
  await factory.contact().uploadFile(filename);
});

When('I submit the contact form', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.contact().submit();
});

Then('I should see a contact success message', async function (this: CustomWorld) {
  const factory = new PageManager(this.page);
  await factory.contact().assertSuccessMessage();
});

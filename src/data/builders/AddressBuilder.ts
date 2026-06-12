import { faker } from '@faker-js/faker';

export interface Address {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class AddressBuilder {
  private address: Address;

  constructor() {
    this.address = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      company: faker.company.name(),
      address: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: 'United States',
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.phone.number(),
    };
  }

  withCountry(country: string): this {
    this.address.country = country;
    return this;
  }

  build(): Address {
    return { ...this.address };
  }
}

import { faker } from '@faker-js/faker';

export interface User {
  name: string;
  email: string;
  password: string;
  title: 'Mr.' | 'Mrs.';
  firstName: string;
  lastName: string;
  dateOfBirth: { day: string; month: string; year: string };
  newsletter: boolean;
  optin: boolean;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class UserBuilder {
  private user: User;

  constructor() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    this.user = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@test.local`,
      password: 'Test@1234',
      title: 'Mr.',
      firstName,
      lastName,
      dateOfBirth: { day: '15', month: '6', year: '1990' },
      newsletter: true,
      optin: true,
      address: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: 'United States',
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.phone.number(),
    };
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withTitle(title: 'Mr.' | 'Mrs.'): this {
    this.user.title = title;
    return this;
  }

  build(): User {
    return { ...this.user };
  }
}

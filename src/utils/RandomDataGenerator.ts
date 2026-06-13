import { faker } from '@faker-js/faker';

export interface RandomUser {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export class RandomDataGenerator {
  /** Generate a random user using faker */
  static user(): RandomUser {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName, provider: 'test.local' }).toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: true }),
      firstName,
      lastName,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipcode: faker.location.zipCode(),
      country: 'United States',
    };
  }

  /** Fetch a random user from randomuser.me API */
  static async fetchOnlineUser(): Promise<RandomUser> {
    const res = await fetch('https://randomuser.me/api/?nat=us');
    const data = (await res.json()) as {
      results: Array<{
        name: { first: string; last: string };
        email: string;
        phone: string;
        location: {
          street: { number: number; name: string };
          city: string;
          state: string;
          postcode: string;
          country: string;
        };
        login: { password: string };
      }>;
    };
    const u = data.results[0];
    return {
      name: `${u.name.first} ${u.name.last}`,
      email: u.email.replace('@', `+${Date.now()}@`),
      password: u.login.password,
      firstName: u.name.first,
      lastName: u.name.last,
      phone: u.phone,
      address: `${u.location.street.number} ${u.location.street.name}`,
      city: u.location.city,
      state: u.location.state,
      zipcode: String(u.location.postcode),
      country: u.location.country,
    };
  }

  static creditCard() {
    return {
      name: faker.person.fullName(),
      number: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: String(new Date().getFullYear() + 2),
    };
  }
}

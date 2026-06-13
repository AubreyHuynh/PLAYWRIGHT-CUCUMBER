import { faker } from '@faker-js/faker';

export interface Card {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export class CardBuilder {
  private card: Card;

  constructor() {
    this.card = {
      nameOnCard: faker.person.fullName(),
      cardNumber: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: String(new Date().getFullYear() + 2),
    };
  }

  withName(name: string): this {
    this.card.nameOnCard = name;
    return this;
  }

  build(): Card {
    return { ...this.card };
  }
}

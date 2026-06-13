export interface Product {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export class ProductBuilder {
  private product: Product;

  constructor() {
    this.product = {
      name: 'Blue Top',
      category: 'Women > Tops',
      price: 500,
      quantity: 1,
    };
  }

  withName(name: string): this {
    this.product.name = name;
    return this;
  }

  withQuantity(qty: number): this {
    this.product.quantity = qty;
    return this;
  }

  build(): Product {
    return { ...this.product };
  }
}

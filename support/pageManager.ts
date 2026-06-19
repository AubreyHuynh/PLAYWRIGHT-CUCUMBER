import { Page } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { ContactPage } from '../src/pages/ContactPage';
import { PaymentPage } from '../src/pages/PaymentPage';
import { OrderConfirmedPage } from '../src/pages/OrderConfirmedPage';

/** Creates and caches page objects on demand. Never instantiate pages directly in steps. */
export class PageManager {
  private cache = new Map<string, unknown>();

  constructor(private page: Page) {}

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) this.cache.set(key, factory());
    return this.cache.get(key) as T;
  }

  home(): HomePage {
    return this.getOrCreate('home', () => new HomePage(this.page));
  }
  login(): LoginPage {
    return this.getOrCreate('login', () => new LoginPage(this.page));
  }
  register(): RegisterPage {
    return this.getOrCreate('register', () => new RegisterPage(this.page));
  }
  products(): ProductsPage {
    return this.getOrCreate('products', () => new ProductsPage(this.page));
  }
  cart(): CartPage {
    return this.getOrCreate('cart', () => new CartPage(this.page));
  }
  checkout(): CheckoutPage {
    return this.getOrCreate('checkout', () => new CheckoutPage(this.page));
  }
  contact(): ContactPage {
    return this.getOrCreate('contact', () => new ContactPage(this.page));
  }
  payment(): PaymentPage {
    return this.getOrCreate('payment', () => new PaymentPage(this.page));
  }
  orderConfirmed(): OrderConfirmedPage {
    return this.getOrCreate('orderConfirmed', () => new OrderConfirmedPage(this.page));
  }
}

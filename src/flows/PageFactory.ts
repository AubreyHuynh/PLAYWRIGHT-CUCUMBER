import { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ContactPage } from '../pages/ContactPage';

/** Factory: creates page objects on demand. Never instantiate pages directly in steps. */
export class PageFactory {
  private cache = new Map<string, unknown>();

  constructor(private page: Page) {}

  private get<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) this.cache.set(key, factory());
    return this.cache.get(key) as T;
  }

  home(): HomePage {
    return this.get('home', () => new HomePage(this.page));
  }
  login(): LoginPage {
    return this.get('login', () => new LoginPage(this.page));
  }
  register(): RegisterPage {
    return this.get('register', () => new RegisterPage(this.page));
  }
  products(): ProductsPage {
    return this.get('products', () => new ProductsPage(this.page));
  }
  cart(): CartPage {
    return this.get('cart', () => new CartPage(this.page));
  }
  checkout(): CheckoutPage {
    return this.get('checkout', () => new CheckoutPage(this.page));
  }
  contact(): ContactPage {
    return this.get('contact', () => new ContactPage(this.page));
  }
}
